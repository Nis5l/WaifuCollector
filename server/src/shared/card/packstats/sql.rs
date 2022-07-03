use sqlx::Acquire;
use chrono::{DateTime, Utc};

use crate::sql::Sql;
use crate::shared::Id;

pub async fn add_pack_stats(sql: &Sql, user_id: &Id, collector_id: &Id, amount: i32, time: &DateTime<Utc>) -> Result<(), sqlx::Error> {
    let mut con = sql.get_con().await?;

    let mut transaction = con.begin().await?;

    for _ in 0..amount {
        sqlx::query(
            "INSERT INTO packstats
             (uid, coid, pstime)
             VALUES
             (?, ?, ?);")
            .bind(user_id)
            .execute(&mut transaction)
            .await?;
    }

    transaction.commit().await?;

    Ok(())
}

pub async fn get_pack_stats_db(sql: &Sql, collector_id: &Id, start_time: &DateTime<Utc>, end_time: &DateTime<Utc>) -> Result<Vec<(DateTime<Utc>, )>, sqlx::Error> {
    let mut con = sql.get_con().await?;

    sqlx::query_as(
        "SELECT pstime
         FROM packstats
         WHERE coid=?
         AND pstime BETWEEN ? AND ?;")
        .bind(collector_id)
        .bind(start_time)
        .bind(end_time)
        .fetch_all(&mut con)
        .await
}
