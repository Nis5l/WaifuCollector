use sqlx::mysql::MySqlQueryResult;

use crate::sql::Sql;

pub async fn delete_notification(sql: &Sql, user_id: i32, notification_id: i32) -> Result<bool, sqlx::Error> {
    let mut con = sql.get_con().await?;

    let result: MySqlQueryResult = sqlx::query(
        "DELETE FROM notifications
         WHERE
         nid = ? AND
         uid = ?;")
        .bind(notification_id)
        .bind(user_id)
        .execute(&mut con)
        .await?;

    Ok(result.rows_affected() != 0)
}
