use crate::sql::Sql;

pub async fn get_user_ranking(sql: &Sql, user_id: i32) -> Result<i32, sqlx::Error> {
    let mut con = sql.get_con().await?;

    let (rank,): (i32,) = sqlx::query_as(
        "SELECT uranking
         FROM users
         WHERE uid=?;")
        .bind(user_id)
        .fetch_one(&mut con)
        .await?;

    Ok(rank)
}
