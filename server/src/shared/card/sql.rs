use sqlx::mysql::MySqlQueryResult;

use crate::sql::Sql;
use crate::config::Config;
use super::data::{CardCreateData, Card, CardDb, SortType, InventoryOptions};
use crate::shared::{Id, util};

pub async fn get_card_type_collector_id(sql: &Sql, card_type_id: &Id) -> Result<Id, sqlx::Error> {
    let mut con = sql.get_con().await?;

    let (id, ): (Id, ) = sqlx::query_as(
        "SELECT coid
         FROM cardtypes
         WHERE ctid=?;")
        .bind(card_type_id)
        .fetch_one(&mut con)
        .await?;

    Ok(id)
}

pub async fn get_card_collector_id(sql: &Sql, card_id: &Id) -> Result<Id, sqlx::Error> {
    let mut con = sql.get_con().await?;

    let (id, ): (Id, ) = sqlx::query_as(
        "SELECT cardtypes.coid
         FROM cards, cardtypes
         WHERE cards.ctid = cardtypes.ctid
         AND cards.cid = ?;")
        .bind(card_id)
        .fetch_one(&mut con)
        .await?;

    Ok(id)
}

//TODO: Think if should also safe collector_id
pub async fn add_card(sql: &Sql, user_id: &Id, card_unlocked_id: &Id, _collector_id: &Id, card: &CardCreateData) -> Result<(), sqlx::Error> {
    let mut con = sql.get_con().await?;

    sqlx::query(
        "INSERT INTO cardunlocks
         (cuid, uid, cid, cuquality, culevel, cfid)
         VALUES
         (?, ?, ?, ?, ?, ?);")
        .bind(card_unlocked_id)
        .bind(user_id)
        .bind(&card.card_id)
        .bind(card.quality)
        .bind(card.level)
        .bind(card.frame_id)
        .execute(&mut con)
        .await?;
    Ok(())
}

pub async fn get_card(sql: &Sql, card_unlocked_id: &Id, user_id: Option<&Id>, config: &Config) -> Result<Option<Card>, sqlx::Error> {
    let mut cards = get_cards(sql, vec![card_unlocked_id.clone()], user_id, config).await?;

    if cards.is_empty() {
        return Ok(None);
    }

    Ok(Some(cards.remove(0)))
}

//TODO: passing the config to sql doesnt feel right, maybe add another step where the CardDbs are
//transformed to Cards

pub async fn get_cards(sql: &Sql, card_unlocked_ids: Vec<Id>, user_id: Option<&Id>, config: &Config) -> Result<Vec<Card>, sqlx::Error> {
    if card_unlocked_ids.is_empty() { return Ok(Vec::new()); }

    let mut con = sql.get_con().await?;

    let mut in_statement = String::from("");

    for i in 0..card_unlocked_ids.len() {
        in_statement += "?";
        if i != card_unlocked_ids.len() - 1 {
            in_statement += ",";
        }
    }

    let extra_checks = if user_id.is_some() {
        "AND cardunlocks.uid = ?"
    } else {
        ""
    };

    let query = format!(
        "SELECT
         cardunlocks.cuid AS id,
         cardunlocks.uid AS userId,
         cardunlocks.culevel AS level,
         cardunlocks.cuquality AS quality,
         cards.cid AS cardId,
         cards.cname AS cardName,
         cardtypes.ctid AS typeId,
         cardtypes.ctname AS typeName,
         cardtypes.uid AS cardTypeUserId,
         cardframes.cfid AS frameId,
         cardframes.cfname AS frameName,
         cardframes.cfimagefront AS frameFront,
         cardframes.cfimageback AS frameBack,
         cardeffects.ceid AS effectId,
         cardeffects.ceimage AS effectImage,
         cardeffects.ceopacity AS effectOpacity
         FROM cardunlocks, cards, cardtypes, cardframes, cardeffects
         WHERE
         cardunlocks.cid = cards.cid AND
         cardunlocks.cfid = cardframes.cfid AND
         cards.ctid = cardtypes.ctid AND
         cardeffects.ceid = cardunlocks.culevel AND
         cardunlocks.cuid IN({})
         {}",
         in_statement,
         extra_checks);

    let mut stmt = sqlx::query_as(&query);

    for uuid in card_unlocked_ids {
        stmt = stmt.bind(uuid);
    }

    if let Some(id) = user_id {
        stmt = stmt.bind(id);
    }

    let cards_db: Vec<CardDb> = stmt.fetch_all(&mut con).await?;

    Ok(cards_db.into_iter().map(|card_db| { Card::from_card_db(card_db, config) }).collect())
}

pub async fn delete_card(sql: &Sql, card_unlocked_id: &Id) -> Result<u64, sqlx::Error> {
    let mut con = sql.get_con().await?;

    let result: MySqlQueryResult = sqlx::query(
        "DELETE FROM cardunlocks
         WHERE cuid=?;")
        .bind(card_unlocked_id)
        .execute(&mut con)
        .await?;

    Ok(result.rows_affected())
}

pub async fn user_owns_card(sql: &Sql, user_id: &Id, card_unlocked_id: &Id, collector_id: Option<&Id>) -> Result<bool, sqlx::Error> {
    let mut con = sql.get_con().await?;

    let query = match collector_id {
        None =>
            "SELECT COUNT(*)
             FROM cardunlocks
             WHERE uid=?
             AND cuid=?;",
        Some(_) =>
            "SELECT COUNT(*)
             FROM cardunlocks, cards
             WHERE cards.cid=cardunlocks.cid
             AND cardunlocks.uid=?
             AND cardunlocks.cuid=?
             AND cards.coid=?;"
    };

    let mut stmt = sqlx::query_as(query)
        .bind(user_id)
        .bind(card_unlocked_id);

    match collector_id {
        None => (),
        Some(_) => { stmt = stmt.bind(collector_id); }
    }

    let (count, ): (i64, ) = stmt.fetch_one(&mut con).await?;

    Ok(count != 0)
}

//TODO: not sure if config should be passed
pub async fn get_inventory(sql: &Sql, config: &Config, options: &InventoryOptions) -> Result<Vec<Card>, sqlx::Error> {
    let mut con = sql.get_con().await?;

    let search = util::escape_for_like(options.search.clone());

    let order_by = match options.sort_type {
        SortType::Name => 
            "cards.cname,
             cardtypes.ctname,
             cardunlocks.culevel DESC,
             cardunlocks.cuquality DESC",
        SortType::Level => 
            "cardunlocks.culevel DESC,
             cardunlocks.cuquality DESC,
             cards.cname,
             cardtypes.ctname",
        SortType::Recent => 
            "cardunlocks.cuid DESC"
    };

    let mut extra_conditions = String::from("");

    if let Some(level) = options.level {
        extra_conditions += &format!("cardunlocks.culevel={} AND\n", level);
    }
    if let Some(card_id) = &options.card_id {
        extra_conditions += &format!("cards.cid={} AND\n", card_id);
    }

    if !options.exclude_uuids.is_empty() {
        extra_conditions += &format!("cardunlocks.cuid NOT IN ({}) AND\n", options.exclude_uuids.iter().map(|i| { i.to_string() }).collect::<Vec<String>>().join(","));
    }

    let query = format!(
        "SELECT
         cardunlocks.cuid AS id,
         cardunlocks.uid AS userId,
         cardunlocks.culevel AS level,
         cardunlocks.cuquality AS quality,
         cards.cid AS cardId,
         cards.cname AS cardName,
         cardtypes.ctid AS typeId,
         cardtypes.ctname AS typeName,
         cardtypes.uid AS cardTypeUserId,
         cardframes.cfid AS frameId,
         cardframes.cfname AS frameName,
         cardframes.cfimagefront AS frameFront,
         cardframes.cfimageback AS frameBack,
         cardeffects.ceid AS effectId,
         cardeffects.ceimage AS effectImage,
         cardeffects.ceopacity AS effectOpacity
         FROM cardunlocks, cards, cardtypes, cardframes, cardeffects
         WHERE
         {}
         cardunlocks.cid = cards.cid
         AND cardunlocks.cfid = cardframes.cfid
         AND cards.ctid = cardtypes.ctid
         AND cardeffects.ceid = cardunlocks.culevel
         AND cards.coid=?
         AND cardunlocks.uid=?
         AND (cards.cname LIKE CONCAT('%', ?, '%') OR cardtypes.ctname LIKE CONCAT('%', ?, '%'))
         ORDER BY
         {}
         LIMIT ? OFFSET ?;",
         extra_conditions,
         order_by);

    let cards_db: Vec<CardDb> = sqlx::query_as(&query)
        .bind(&options.collector_id)
        .bind(&options.user_id)
        .bind(&search)
        .bind(&search)
        .bind(options.count)
        .bind(options.offset)
        .fetch_all(&mut con)
        .await?;

    Ok(cards_db.into_iter().map(|card_db| { Card::from_card_db(card_db, config) }).collect())
}
