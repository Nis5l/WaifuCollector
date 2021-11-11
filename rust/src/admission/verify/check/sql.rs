use crate::sql::Sql;
use crate::shared::Id;
use super::data::VerifiedDb;

pub async fn get_verify_data(sql: &Sql, user_id: Id) -> Result<VerifiedDb, sqlx::Error> {
    let mut con = sql.get_con().await?;

    sqlx::query_as(
        "SELECT uemail, uverified
         FROM users
         WHERE uid=?;")
        .bind(user_id)
        .fetch_one(&mut con)
        .await
}
