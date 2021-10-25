use sqlx::mysql::MySqlQueryResult;

use crate::sql::Sql;
use crate::user::{UserVerified, UserRanking};

pub async fn email_exists(sql: &Sql, email: String) -> Result<bool, sqlx::Error> {

    let mut con = sql.get_con().await?;

    //TODO: rename to users
    let (count,): (i32,) = sqlx::query_as(
        "SELECT COUNT(*)
         FROM users
         WHERE uemail=?;")
        .bind(email)
        .fetch_one(&mut con)
        .await?;

    Ok(count != 0)
}

pub async fn user_exists(sql: &Sql, username: String) -> Result<bool, sqlx::Error> {

    let mut con = sql.get_con().await?;

    let (count,): (i32,) = sqlx::query_as(
        "SELECT COUNT(*)
         FROM users
         WHERE LOWER(uusername) = LOWER(?);")
        .bind(username)
        .fetch_one(&mut con)
        .await?;


    Ok(count != 0)
}

pub async fn register(sql: &Sql, username: String, password_hash: String, email: String) -> Result<u64, sqlx::Error> {

    let mut con = sql.get_con().await?;

    let result: MySqlQueryResult = sqlx::query(
        "INSERT INTO users
         (uusername, upassword, uemail, uranking, uverified)
         VALUES
         (?, ?, ?, ?, ?);")
        .bind(username)
        .bind(password_hash)
        .bind(email)
        .bind(UserVerified::No as i32)
        .bind(UserRanking::Standard as i32)
        .execute(&mut con)
        .await?;

    Ok(result.last_insert_id())
}
