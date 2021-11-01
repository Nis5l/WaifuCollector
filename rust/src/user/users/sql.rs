use crate::sql::Sql;
use crate::shared::Id;

pub async fn get_users(sql: &Sql, mut username: String, amount: u32) -> Result<Vec<(String, Id)>, sqlx::Error> {

    let mut con = sql.get_con().await?;

    username = username
        .replace("!", "!!")
        .replace("%", "!%")
        .replace("_", "!_")
        .replace("[", "![");

    let users: Vec<(String, Id)> = sqlx::query_as(
        "SELECT uusername, uid
         FROM users
         WHERE uusername LIKE CONCAT('%', ?, '%')
         LIMIT ?;")
        .bind(username)
        .bind(amount)
        .fetch_all(&mut con)
        .await?;

    Ok(users)
}
