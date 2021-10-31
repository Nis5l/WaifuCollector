use crate::sql::Sql;

pub async fn user_id_from_username(sql: &Sql, username: &str) -> Result<Option<i32>, sqlx::Error> {
    let mut con = sql.get_con().await?;

    let stmt: Result<(i32, ), sqlx::Error> = sqlx::query_as(
        "SELECT uid
         FROM users
         WHERE uusername=?")
        .bind(username)
        .fetch_one(&mut con)
        .await;

    if let Err(sqlx::Error::RowNotFound) = stmt {
        return Ok(None);
    }

    Ok(Some(stmt?.0))
}

pub async fn user_id_exists(sql: &Sql, user_id: i32) -> Result<bool, sqlx::Error> {
    let mut con = sql.get_con().await?;

    let (count, ): (i64, ) = sqlx::query_as(
        "SELECT COUNT(*)
         FROM users
         WHERE uid=?")
        .bind(user_id)
        .fetch_one(&mut con)
        .await.unwrap();


    Ok(count != 0)
}
