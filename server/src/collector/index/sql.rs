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
