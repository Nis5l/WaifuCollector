use crate::{shared::collector::Collector, sql::Sql};
use crate::shared::util;

pub async fn get_collectors(sql: &Sql, mut search: String, amount: u32, offset: u32) -> Result<Vec<Collector>, sqlx::Error> {
    let mut con = sql.get_con().await?;

    search = util::escape_for_like(search);

    let collectors = sqlx::query_as(
        "SELECT coid as id,
                coname as name,
                uid as userId
         FROM collectors
         WHERE coname LIKE CONCAT('%', ?, '%')
         LIMIT ? OFFSET ?;")
        .bind(search)
        .bind(amount)
        .bind(offset)
        .fetch_all(&mut con)
        .await?;

    Ok(collectors)
}

pub async fn get_collectors_count(sql: &Sql, mut search: String) -> Result<u32, sqlx::Error> {
    let mut con = sql.get_con().await?;

    search = util::escape_for_like(search);

    let (count, ): (i64, ) = sqlx::query_as(
        "SELECT COUNT(*)
         FROM collectors
         WHERE coname LIKE CONCAT('%', ?, '%');")
        .bind(search)
        .fetch_one(&mut con)
        .await?;

    Ok(count as u32)
}
