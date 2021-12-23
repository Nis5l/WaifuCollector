use crate::sql::Sql;

pub async fn get_user_username(sql: &Sql, user_id: u32) -> Result<Option<String>, sqlx::Error> {

    let mut con = sql.get_con().await?;

    let stmt = sqlx::query_as(
        "SELECT uusername
         FROM users
         WHERE uid=?;")
        .bind(user_id)
        .fetch_one(&mut con)
        .await;

    if let Err(sqlx::Error::RowNotFound) = stmt {
        return Ok(None);
    }

    let (user_name,): (String,) = stmt?;

    Ok(Some(user_name))
}
