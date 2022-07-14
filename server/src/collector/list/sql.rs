use crate::{shared::collector::Collector, sql::Sql};


pub async fn get_all_collectors(sql: &Sql) -> Result<Vec<Collector>, sqlx::Error> {
    let mut con = sql.get_con().await?;

    let collectors = sqlx::query_as(
        "SELECT coid as id, coname as name, uid as userId FROM collectors")
        .fetch_all(&mut con)
        .await?;

    Ok(collectors)
}
