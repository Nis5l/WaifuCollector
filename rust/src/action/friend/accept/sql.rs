use crate::sql::Sql;
use sqlx::mysql::MySqlQueryResult;

pub async fn accept_friend_request(sql: &Sql, user_id: i32, user_id_accept: i32) -> Result<bool, sqlx::Error> {
    let mut con = sql.get_con().await?;

    let result: MySqlQueryResult = sqlx::query(
        "UPDATE friends
         SET frstatus=1
         WHERE uidtwo=? AND uidone=? AND frstatus=0;")
        .bind(user_id)
        .bind(user_id_accept)
        .execute(&mut con)
        .await?;

    Ok(result.rows_affected() != 0)
}
