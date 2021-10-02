use crate::sql::Sql;
use super::data::LoginDb;

pub async fn get_user_password(sql: &Sql, in_username: String) -> Result<LoginDb, sqlx::Error> {

    let mut con = sql.get_con().await?;

    //TODO: rename to users
    let login_data: LoginDb = sqlx::query_as(
        "SELECT id, username, password
         FROM user
         WHERE username=?;")
        .bind(in_username)
        .fetch_one(&mut con)
        .await?;

    Ok(login_data)
}
