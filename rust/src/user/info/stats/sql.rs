use crate::sql::Sql;
use crate::shared::Id;

pub async fn get_user_card_count(sql: &Sql, user_id: Id) -> Result<i64, sqlx::Error> {
    let mut con = sql.get_con().await?;

    let (count, ): (i64, ) = sqlx::query_as(
        "SELECT COUNT(DISTINCT cid)
         FROM unlockedcards
         WHERE uid=?;")
        .bind(user_id)
        .fetch_one(&mut con)
        .await?;

    Ok(count)
}

pub async fn get_max_card_count(sql: &Sql) -> Result<i64, sqlx::Error> {
    let mut con = sql.get_con().await?;

    let (count, ): (i64, ) = sqlx::query_as(
        "SELECT COUNT(*)
         FROM cards")
        .fetch_one(&mut con)
        .await?;

    Ok(count)
}
