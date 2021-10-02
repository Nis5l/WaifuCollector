use sqlx::mysql::MySqlQueryResult;

use crate::sql::Sql;
use crate::user::{UserVerified, UserRanking};

pub async fn email_exists(sql: &Sql, in_email: String) -> Result<bool, sqlx::Error> {

    let mut con = sql.get_con().await?;

    //TODO: rename to users
    let (count,): (i32,) = sqlx::query_as(
        "SELECT COUNT(*)
         FROM user
         WHERE email=?;")
        .bind(in_email)
        .fetch_one(&mut con)
        .await?;

    Ok(count != 0)
}

pub async fn user_exists(sql: &Sql, in_username: String) -> Result<bool, sqlx::Error> {

    let mut con = sql.get_con().await?;

    let (count,): (i32,) = sqlx::query_as(
        "SELECT COUNT(*)
         FROM user
         WHERE LOWER(username) = LOWER(?);")
        .bind(in_username)
        .fetch_one(&mut con)
        .await?;


    Ok(count != 0)
}

pub async fn register(sql: &Sql, in_username: String, in_password_hash: String, in_email: String) -> Result<u64, sqlx::Error> {

    let mut con = sql.get_con().await?;

    let result: MySqlQueryResult = sqlx::query(
        "INSERT INTO user
         (username, password, email, ranking, verified)
         VALUES
         (?, ?, ?, ?, ?);")
        .bind(in_username)
        .bind(in_password_hash)
        .bind(in_email)
        .bind(UserVerified::No as i32)
        .bind(UserRanking::Standard as i32)
        .execute(&mut con)
        .await?;

    Ok(result.last_insert_id())
}
