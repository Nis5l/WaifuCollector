use sqlx::mysql::MySqlQueryResult;

use crate::sql::Sql;

pub async fn delete_all_notifications(sql: &Sql, user_id: i32) -> Result<u64, sqlx::Error> {
    let mut con = sql.get_con().await?;

    let result: MySqlQueryResult = sqlx::query(
        "DELETE FROM notifications
         WHERE
         uid = ?;")
        .bind(user_id)
        .execute(&mut con)
        .await?;

    Ok(result.rows_affected())
}
