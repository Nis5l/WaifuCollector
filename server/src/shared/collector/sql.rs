use crate::sql::Sql;
use crate::shared::Id;

pub async fn collector_exists(sql: &Sql, collector_id: &Id) -> Result<bool, sqlx::Error> {
    let mut con = sql.get_con().await?;

    let (count, ): (i32, ) = sqlx::query_as(
        "SELECT COUNNT(*)
         FROM collectors
         WHERE coid=?;")
        .bind(collector_id)
        .fetch_one(&mut con)
        .await?;

    Ok(count != 0)
}
