use crate::sql::Sql;
use crate::shared::card::data::{UnlockedCardDb, UnlockedCard};
use crate::config::Config;
use crate::shared::Id;

//TODO: dont pass config
pub async fn trade_cards(sql: &Sql, user_id: &Id, trade_id: &Id, config: &Config) -> Result<Vec<UnlockedCard>, sqlx::Error> {
    let mut con = sql.get_con().await?;

    let cards_db: Vec<UnlockedCardDb> = sqlx::query_as(
        "SELECT
         cardunlocks.cuid AS id,
         cardunlocks.uid AS userId,
         cardunlocks.culevel AS level,
         cardunlocks.cuquality AS quality,
         cards.cid AS cardId,
         cards.uid AS cardUserId,
         cards.cname AS cardName,
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
         tradecards.tid=? AND cardunlocks.uid<>?;")
         .bind(trade_id)
         .bind(user_id)
         .fetch_all(&mut con)
         .await?;

    let cards = cards_db.into_iter().map(|card_db| { UnlockedCard::from_card_db(card_db, config) }).collect();

    Ok(cards)
}

//TODO: dont pass config
pub async fn trade_suggestions(sql: &Sql, user_id: &Id, trade_id: &Id, config: &Config) -> Result<Vec<UnlockedCard>, sqlx::Error> {
    let mut con = sql.get_con().await?;

    let cards_db: Vec<UnlockedCardDb> = sqlx::query_as(
        "SELECT
         cardunlocks.cuid AS id,
         cardunlocks.uid AS userId,
         cardunlocks.culevel AS level,
         cardunlocks.cuquality AS quality,
         cards.cid AS cardId,
         cards.uid AS cardUserId,
         cards.cname AS cardName,
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
         tradesuggestions.tid=? AND cardunlocks.uid<>?;")
         .bind(trade_id)
         .bind(user_id)
         .fetch_all(&mut con)
         .await?;

    let cards = cards_db.into_iter().map(|card_db| { UnlockedCard::from_card_db(card_db, config) }).collect();

    Ok(cards)
}
