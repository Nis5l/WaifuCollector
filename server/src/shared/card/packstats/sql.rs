use sqlx::{MySql, pool::PoolConnection};
use chrono::{DateTime, Utc};

use super::data::PackStatsPair;

//TODO: this is wrong
pub async fn load_pack_stats(con: &mut PoolConnection<MySql>, start: &DateTime<Utc>, end: &DateTime<Utc>) -> Result<Vec<PackStatsPair>, sqlx::Error> {
    sqlx::query_as(
        "SELECT pstime, psamount
         FROM packstats
         WHERE pstime BETWEEN ? AND ?;")
        .bind(start)
        .bind(end)
        .fetch_all(con)
        .await
}

pub async fn add_pack_stats(con: &mut PoolConnection<MySql>, time: &DateTime<Utc>, amount: i32) -> Result<Vec<PackStatsPair>, sqlx::Error> {
    sqlx::query_as(
        "INSERT INTO packstats
         (psamount, pstime)
         VALUES (?, ?);")
        .bind(amount)
        .bind(time)
        .bind(amount)
        .fetch_all(con)
        .await
}
