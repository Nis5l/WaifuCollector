use crate::sql::Sql;

pub async fn get_users(sql: &Sql, mut in_username: String, amount: u32) -> Result<Vec<(String, i32)>, sqlx::Error> {

    let mut con = sql.get_con().await?;

    in_username = in_username
        .replace("!", "!!")
        .replace("%", "!%")
        .replace("_", "!_")
        .replace("[", "![");

    let users: Vec<(String, i32)> = sqlx::query_as(
        "SELECT username, id
         FROM user
         WHERE username LIKE CONCAT('%', ?, '%')
         LIMIT ?;")
        .bind(in_username)
        .bind(amount)
        .fetch_all(&mut con)
        .await?;

    Ok(users)
}
