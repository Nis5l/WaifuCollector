use sqlx::mysql::MySqlQueryResult;

use crate::sql::Sql;
use crate::config::Config;
use super::data::{CardCreateData, Card, CardDb};

pub async fn add_card(sql: &Sql, user_id: i32, card: &CardCreateData) -> Result<i32, sqlx::Error> {
    let mut con = sql.get_con().await?;

    let stmt: MySqlQueryResult = sqlx::query(
        "INSERT INTO unlocked
         (userId, cardId, quality, level, frameId)
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

//TODO: passing the config to sql doesnt feel right, maybe add another step where the CardDbs are
//transformed to Cards
pub async fn get_cards(sql: &Sql, card_uuids: Vec<i32>, config: &Config) -> Result<Vec<Card>, sqlx::Error> {

    let mut con = sql.get_con().await?;

    let mut in_statement = String::from("");

    for i in 0..card_uuids.len() {
        in_statement += "?";
        if i != card_uuids.len() - 1 {
            in_statement += ",";
        }
    }

    let query = format!(
        "SELECT
         unlocked.id as id,
         unlocked.userId as userId,
         unlocked.level as level,
         unlocked.quality as quality,
         card.id as cardId,
         card.cardName as cardName,
         card.cardImage as cardImage,
         cardtype.id as typeId,
         cardtype.name as typeName,
         frame.id as frameId,
         frame.name as frameName,
         frame.path_front as frameFront,
         frame.path_back as frameBack,
         effect.id as effectId,
         effect.path as effectImage,
         effect.opacity as effectOpacity
         FROM unlocked INNER JOIN card, cardtype, frame, effect
         WHERE
         unlocked.cardId = card.id AND
         card.typeId = cardtype.id AND
         effect.id = unlocked.level AND
         unlocked.id IN({})",
         in_statement);

    let mut stmt = sqlx::query_as(&query);

    for uuid in card_uuids {
        stmt = stmt.bind(uuid);
    }

    let cards_db: Vec<CardDb> = stmt.fetch_all(&mut con).await?;

    let cards: Vec<Card> = cards_db.into_iter().map(|card_db| { Card::from_card_db(card_db, config) }).collect();

    Ok(cards)
}
