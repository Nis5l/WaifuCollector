use sqlx::mysql::MySqlQueryResult;
use chrono::{DateTime, Utc};

use crate::sql::Sql;
use super::data::CardCreateDataDb;

pub async fn set_pack_time(sql: &Sql, user_id: i32, last_opened: DateTime<Utc>) -> Result<(), sqlx::Error> {
    let mut con = sql.get_con().await?;

    let result: MySqlQueryResult = sqlx::query(
        "UPDATE packtime
         SET lastOpened=?
         WHERE userId=?;")
        .bind(last_opened)
        .bind(user_id)
        .execute(&mut con)
        .await?;

    if result.rows_affected() == 0 {
        sqlx::query(
            "INSERT INTO packtime
             (userId, lastOpened)
             VALUES
             (?, ?);")
            .bind(user_id)
            .bind(last_opened)
            .execute(&mut con)
            .await?;
    }

    Ok(())
}

pub async fn get_random_card_data(sql: &Sql, card_amount: u32) -> Result<Vec<CardCreateDataDb>, sqlx::Error> {
    let mut con = sql.get_con().await?;

    let cards: Vec<CardCreateDataDb> = sqlx::query_as(
        "SELECT
         card.id as cardId,
         frame.id as frameId
         FROM
         card,
         frame
         ORDER BY
         RAND()
         LIMIT ?;")
        .bind(card_amount)
        .fetch_all(&mut con)
        .await?;

    Ok(cards)
}
