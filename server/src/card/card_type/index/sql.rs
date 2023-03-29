use crate::sql::Sql;
use crate::shared::{util, Id};
use crate::shared::card::data::CardType;

pub async fn get_card_types(sql: &Sql, collector_id: &Id, mut name: String, amount: u32, offset: u32) -> Result<Vec<CardType>, sqlx::Error> {
    let mut con = sql.get_con().await?;

    name = util::escape_for_like(name);

    let card_types: Vec<CardType> = sqlx::query_as(
        "SELECT
         ctid as id,
         uid as userId,
         ctname as name
         FROM cardtypes
         WHERE ctname LIKE CONCAT('%', ?, '%') AND
         coid = ?
         LIMIT ? OFFSET ?;")
        .bind(name)
        .bind(collector_id)
        .bind(amount)
        .bind(offset)
        .fetch_all(&mut con)
        .await?;

    Ok(card_types)
}
