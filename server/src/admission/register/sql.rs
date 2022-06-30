use crate::sql::Sql;
use crate::shared::Id;
use crate::shared::user::data::{UserVerifiedDb, UserRanking};

pub async fn user_exists(sql: &Sql, username: &str) -> Result<bool, sqlx::Error> {

    let mut con = sql.get_con().await?;

    //TODO: is it case sensitive?;
    let (count,): (i64,) = sqlx::query_as(
        "SELECT COUNT(*)
         FROM users
         WHERE LOWER(uusername) = LOWER(?);")
        .bind(username)
        .fetch_one(&mut con)
        .await?;


    Ok(count != 0)
}

pub async fn register(sql: &Sql, id: &Id, username: &str, password_hash: &str, email: &str) -> Result<(), sqlx::Error> {

    let mut con = sql.get_con().await?;

    sqlx::query(
        "INSERT INTO users
         (uid, uusername, upassword, uemail, uranking, uverified)
         VALUES
         (?, ?, ?, ?, ?, ?);")
        .bind(id)
        .bind(username)
        .bind(password_hash)
        .bind(email)
        .bind(UserVerifiedDb::No as i32)
        .bind(UserRanking::Standard as i32)
        .execute(&mut con)
        .await?;

    Ok(())
}
