use super::data::Notification;
use crate::sql::Sql;
use crate::shared::Id;

pub async fn get_notifications(sql: &Sql, user_id: &Id) -> Result<Vec<Notification>, sqlx::Error> {

    let mut con = sql.get_con().await?;

    let notifications: Vec<Notification> = sqlx::query_as(
        "SELECT nid AS id, uid AS userId, ntitle AS title, nmessage AS message, nurl AS url, ntime AS time
         FROM notifications
         WHERE uid = ?;")
        .bind(user_id)
        .fetch_all(&mut con)
        .await?;

    Ok(notifications)
}
