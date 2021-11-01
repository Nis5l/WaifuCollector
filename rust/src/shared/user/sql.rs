use crate::sql::Sql;
use crate::shared::Id;

pub async fn user_id_from_username(sql: &Sql, username: &str) -> Result<Option<Id>, sqlx::Error> {
    let mut con = sql.get_con().await?;

    let stmt: Result<(Id, ), sqlx::Error> = sqlx::query_as(
        "SELECT uid
         FROM users
         WHERE uusername=?;")
        .bind(username)
        .fetch_one(&mut con)
        .await;

    if let Err(sqlx::Error::RowNotFound) = stmt {
        return Ok(None);
    }

    Ok(Some(stmt?.0))
}

pub async fn username_from_user_id(sql: &Sql, user_id: Id) -> Result<Option<String>, sqlx::Error> {
    let mut con = sql.get_con().await?;

    let stmt: Result<(String, ), sqlx::Error> = sqlx::query_as(
        "SELECT uusername
         FROM users
         WHERE uid=?;")
        .bind(user_id)
        .fetch_one(&mut con)
        .await;

    if let Err(sqlx::Error::RowNotFound) = stmt {
        return Ok(None)
    }


    Ok(Some(stmt?.0))
}
