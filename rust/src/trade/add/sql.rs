use sqlx::mysql::MySqlQueryResult;

use crate::sql::Sql;
use crate::shared::Id;

pub async fn trade_card_count(sql: &Sql, user_id: Id, user_id_friend: Id) -> Result<i64, sqlx::Error> {
    let mut con = sql.get_con().await?;

    let (count, ): (i64, ) = sqlx::query_as(
        "SELECT COUNT(*)
         FROM tradecards
         WHERE uidone=? AND uidtwo=?;")
        .bind(user_id) .bind(user_id_friend)
        .bind(user_id)
        .bind(user_id_friend)
        .fetch_one(&mut con)
        .await?;

    Ok(count)
}

pub async fn card_in_trade(sql: &Sql, card_unlocked_id: Id) -> Result<bool, sqlx::Error> {
    let mut con = sql.get_con().await?;

    let (count, ): (i64, ) = sqlx::query_as(
        "SELECT COUNT(*)
         FROM tradecards
         WHERE cuid=?;")
        .bind(card_unlocked_id)
        .fetch_one(&mut con)
        .await?;

    Ok(count != 0)
}

pub async fn trade_add_card(sql: &Sql, user_id: Id, user_id_friend: Id, card_unlocked_id: Id) -> Result<(), sqlx::Error> {
    let mut con = sql.get_con().await?;

    sqlx::query(
        "INSERT INTO tradecards
         (uidone, uidtwo, cuid)
         VALUES
         (?, ?, ?);")
        .bind(user_id)
        .bind(user_id_friend)
        .bind(card_unlocked_id)
        .execute(&mut con)
        .await?;

    Ok(())
}

pub async fn remove_suggestions(sql: &Sql, card_unlocked_id: Id) -> Result<u64, sqlx::Error> {
    let mut con = sql.get_con().await?;

    let stmt: MySqlQueryResult = sqlx::query(
        "DELETE FROM tradesuggestions
         WHERE cuid=?;")
        .bind(card_unlocked_id)
        .execute(&mut con)
        .await?;

    Ok(stmt.rows_affected())
}
