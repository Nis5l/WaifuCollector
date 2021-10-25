use crate::sql::Sql;

pub async fn get_users(sql: &Sql, mut username: String, amount: u32) -> Result<Vec<(String, i32)>, sqlx::Error> {

    let mut con = sql.get_con().await?;

    username = username
        .replace("!", "!!")
        .replace("%", "!%")
        .replace("_", "!_")
        .replace("[", "![");

    let users: Vec<(String, i32)> = sqlx::query_as(
        "SELECT uusername AS username, uid AS id
         FROM users
         WHERE uusername LIKE CONCAT('%', ?, '%')
         LIMIT ?;")
        .bind(username)
        .bind(amount)
        .fetch_all(&mut con)
        .await?;

    Ok(users)
}
