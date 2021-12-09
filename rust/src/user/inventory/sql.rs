use crate::shared::Id;
use crate::sql::Sql;
use crate::shared::util;
use crate::shared::card::data::{Card, CardDb};
use crate::config::Config;
use super::data::{SortType, InventoryOptions};

//TODO: not sure if config should be passed
pub async fn get_inventory(sql: &Sql, config: &Config, options: &InventoryOptions) -> Result<Vec<Card>, sqlx::Error> {
    let mut con = sql.get_con().await?;

    let search = util::escape_for_like(options.search.clone());

    let oder_by = match options.sort_type {
        SortType::Name => 
            "cards.cname,
             cardtypes.ctname,
             cardunlocks.culevel DESC,
             cardunlocks.cuquality DESC",
        SortType::Level => 
            "cardunlocks.culevel DESC,
             cardunlocky.cuquality DESC,
             cards.ctname,
             cardtypes.ctname",
        SortType::Recent => 
            "cardunlocks.cuid DESC"
    };

    let mut extra_conditions = String::from("");

    if let Some(level) = options.level {
        extra_conditions += &format!("cardunlocks.culevel={} AND\n", level);
    }
    if let Some(card_id) = options.card_id {
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
         {}
         cardunlocks.cid = cards.cid AND
         cardunlocks.cfid = cardframes.cfid AND
         cards.ctid = cardtypes.ctid AND
         cardeffects.ceid = cardunlocks.culevel AND
         (cards.cname LIKE CONCAT('%', ?, '%') OR cardtypes.ctname LIKE CONCAT('%', ?, '%'))
         ORDER BY
         {}
         LIMIT ? OFFSET ?;",
         extra_conditions,
         oder_by);

    let cards_db: Vec<CardDb> = sqlx::query_as(&query)
        .bind(&search)
        .bind(&search)
        .bind(options.count)
        .bind(options.offset)
        .fetch_all(&mut con)
        .await?;

    Ok(cards_db.into_iter().map(|card_db| { Card::from_card_db(card_db, config) }).collect())
}

pub async fn get_trade_uuids(sql: &Sql, user_id: Id, friend_id: Id, suggestions: bool) -> Result<Vec<Id>, sqlx::Error> {
    let mut con = sql.get_con().await?;

    let query = format!(
        "SELECT tradecards.cuid
         FROM trades
         WHERE tradecards.uidone=? AND
         tradecards.uidtwo=?
         {};",
         if suggestions {
             "UNION
              SELECT tradesuggestions.cuid
              FROM tradesuggestions
              WHERE tradesuggestions.uidone=? AND
              tradesuggestions.uidtwo=?;"
         } else { "" });

    let mut stmt = sqlx::query_as(&query)
        .bind(user_id)
        .bind(friend_id);

    if suggestions {
        stmt = stmt
        .bind(user_id)
        .bind(friend_id);
    }

    let ids: Vec<(Id, )> = stmt.fetch_all(&mut con).await?;

    Ok(ids.iter().map(|i| { i.0 }).collect())
}
