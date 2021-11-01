use sqlx::mysql::MySqlQueryResult;

use crate::sql::Sql;
use crate::shared::Id;

pub async fn delete_all_notifications(sql: &Sql, user_id: Id) -> Result<u64, sqlx::Error> {
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
