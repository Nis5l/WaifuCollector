use sqlx::mysql::MySqlQueryResult;

use crate::sql::Sql;
use crate::config::Config;
use super::data::{CardCreateData, Card, CardDb};

pub async fn add_card(sql: &Sql, user_id: i32, card: &CardCreateData) -> Result<i32, sqlx::Error> {
    let mut con = sql.get_con().await?;

    let stmt: MySqlQueryResult = sqlx::query(
        "INSERT INTO unlockedcards 
         (uid, cid, ucquality, uclevel, fid)
         VALUES
         (?, ?, ?, ?, ?);")
        .bind(user_id)
        .bind(card.card_id)
        .bind(card.quality)
        .bind(card.level)
        .bind(card.frame_id)
        .execute(&mut con)
        .await?;

    Ok(stmt.last_insert_id() as i32)
}

pub async fn get_card(sql: &Sql, card_uuid: i32, user_id: Option<i32>, config: &Config) -> Result<Option<Card>, sqlx::Error> {
    let mut cards = get_cards(sql, vec![card_uuid], user_id, config).await?;

    if cards.is_empty() {
        return Ok(None);
    }

    Ok(Some(cards.remove(0)))
}

//TODO: passing the config to sql doesnt feel right, maybe add another step where the CardDbs are
//transformed to Cards
pub async fn get_cards(sql: &Sql, card_uuids: Vec<i32>, user_id: Option<i32>, config: &Config) -> Result<Vec<Card>, sqlx::Error> {
    if card_uuids.is_empty() { return Ok(Vec::new()); }

    let mut con = sql.get_con().await?;

    let mut in_statement = String::from("");

    for i in 0..card_uuids.len() {
        in_statement += "?";
        if i != card_uuids.len() - 1 {
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
         cards.cimage AS cardImage,
         cardtypes.ctid AS typeId,
         cardtypes.ctname AS typeName,
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
         cards.ctid = cardtypes.ctid AND
         cardeffects.ceid = cardunlocks.culevel AND
         cardunlocks.cuid IN({})
         {}",
         in_statement,
         extra_checks);

    let mut stmt = sqlx::query_as(&query);

    for uuid in card_uuids {
        stmt = stmt.bind(uuid);
    }

    if let Some(id) = user_id {
        stmt = stmt.bind(id);
    }

    let cards_db: Vec<CardDb> = stmt.fetch_all(&mut con).await?;

    let cards: Vec<Card> = cards_db.into_iter().map(|card_db| { Card::from_card_db(card_db, config) }).collect();

    Ok(cards)
}

pub async fn delete_card(sql: &Sql, card_uuid: i32) -> Result<u64, sqlx::Error> {
    let mut con = sql.get_con().await?;

    let result: MySqlQueryResult = sqlx::query(
        "DELETE FROM cardunlocks
        WHERE cuid=?;")
        .bind(card_uuid)
        .execute(&mut con).await?;

    Ok(result.rows_affected())
}
