use crate::sql::Sql;
use super::data::LoginDb;

pub async fn get_user_password(sql: &Sql, username: String) -> Result<Option<LoginDb>, sqlx::Error> {

    let mut con = sql.get_con().await?;

    let login_data: Result<LoginDb, sqlx::Error> = sqlx::query_as(
        "SELECT uid AS id, uusername AS username, upassword AS password, uranking AS role
         FROM users
         WHERE uusername=?;")
        .bind(username)
        .fetch_one(&mut con)
        .await;

    if let Err(sqlx::Error::RowNotFound) = login_data {
        return Ok(None);
    }

    Ok(Some(login_data?))
}
