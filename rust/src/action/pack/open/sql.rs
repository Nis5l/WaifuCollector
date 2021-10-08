use sqlx::mysql::MySqlQueryResult;
use chrono::{DateTime, Utc};

use crate::sql::Sql;

pub async fn get_pack_time(sql: &Sql, user_id: i32) -> Result<Option<DateTime<Utc>>, sqlx::Error> {

    let mut con = sql.get_con().await?;

    let stmt = sqlx::query_as(
        "SELECT lastOpened
         FROM packtime
         WHERE userID=?;")
        .bind(user_id)
        .fetch_one(&mut con)
        .await;

    if let Err(sqlx::Error::RowNotFound) = stmt {
        return Ok(None);
    }

    let (time, ): (Option<DateTime<Utc>>, ) = stmt?;

    Ok(time)
}

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
