use crate::sql::Sql;
use super::data::LoginDb;

pub async fn get_user_password(sql: &Sql, username: String) -> Result<LoginDb, sqlx::Error> {

    let mut con = sql.get_con().await?;

    let login_data: LoginDb = sqlx::query_as(
        "SELECT uid AS id, uusername AS username, upassword AS password
         FROM users
         WHERE uusername=?;")
        .bind(username)
        .fetch_one(&mut con)
        .await?;

    Ok(login_data)
}
