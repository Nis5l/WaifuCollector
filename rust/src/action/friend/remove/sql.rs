use sqlx::mysql::MySqlQueryResult;

use crate::sql::Sql;

pub async fn remove_friend(sql: &Sql, user_id: i32, user_id_remove: i32) -> Result<bool, sqlx::Error> {
    let mut con = sql.get_con().await?;

    let result: MySqlQueryResult = sqlx::query(
        "DELETE FROM friends
         WHERE (uidone=? AND uidtwo=?) OR (uidtwo=? AND uidone=?)")
        .bind(user_id)
        .bind(user_id_remove)
        .bind(user_id)
        .bind(user_id_remove)
        .execute(&mut con)
        .await?;

    Ok(result.rows_affected() != 0)
}
