use crate::sql::Sql;
use super::data::Notification;

pub async fn get_notifications(sql: &Sql, user_id: i32) -> Result<Vec<Notification>, sqlx::Error> {

    let mut con = sql.get_con().await?;

    let notifications: Vec<Notification> = sqlx::query_as(
        "SELECT id, userId, title, message, url, time
         FROM notifications
         WHERE userID = ?;")
        .bind(user_id)
        .fetch_all(&mut con)
        .await?;

    Ok(notifications)
}
