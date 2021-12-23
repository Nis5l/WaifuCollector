use crate::sql::Sql;
use crate::shared::card::data::{CardDb, Card};
use crate::config::Config;
use crate::shared::Id;

//TODO: passing the config to sql doesnt feel right
pub async fn trade_cards(sql: &Sql, user_id: Id, user_id_friend: Id, config: &Config) -> Result<Vec<Card>, sqlx::Error> {
    let mut con = sql.get_con().await?;

    let cards_db: Vec<CardDb> = sqlx::query_as(
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
         FROM tradecards, cardunlocks, cards, cardtypes, cardframes, cardeffects
         WHERE
         cardunlocks.cid = cards.cid AND
         cardunlocks.cfid = cardframes.cfid AND
         cards.ctid = cardtypes.ctid AND
         cardeffects.ceid = cardunlocks.culevel AND
         cardunlocks.cuid = tradecards.cuid AND
         tradecards.uidone=? AND tradecards.uidtwo=?;")
         .bind(user_id)
         .bind(user_id_friend)
         .fetch_all(&mut con)
         .await?;

    let cards = cards_db.into_iter().map(|card_db| { Card::from_card_db(card_db, config) }).collect();

    Ok(cards)
}

pub async fn trade_suggestions(sql: &Sql, user_id: Id, user_id_friend: Id, config: &Config) -> Result<Vec<Card>, sqlx::Error> {
    let mut con = sql.get_con().await?;

    let cards_db: Vec<CardDb> = sqlx::query_as(
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
         FROM tradesuggestions, cardunlocks, cards, cardtypes, cardframes, cardeffects
         WHERE
         cardunlocks.cid = cards.cid AND
         cardunlocks.cfid = cardframes.cfid AND
         cards.ctid = cardtypes.ctid AND
         cardeffects.ceid = cardunlocks.culevel AND
         cardunlocks.cuid = tradesuggestions.cuid AND
         tradesuggestions.uidone=? AND tradesuggestions.uidtwo=?;")
         .bind(user_id)
         .bind(user_id_friend)
         .fetch_all(&mut con)
         .await?;

    let cards = cards_db.into_iter().map(|card_db| { Card::from_card_db(card_db, config) }).collect();

    Ok(cards)
}
