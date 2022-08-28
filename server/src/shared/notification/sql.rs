use super::data::NotificationCreateData;
use crate::sql::Sql;
use crate::shared::Id;

pub async fn add_notification(sql: &Sql, user_id: Id, notification_create: &NotificationCreateData) -> Result<(), sqlx::Error> {
    let mut con = sql.get_con().await?;
    //TODO: if already exists

    sqlx::query(
        "INSERT INTO notifications
         (uid, ntitle, nmessage, nurl, ntime)
         VALUES
         (?, ?, ?, ?, ?);")
        .bind(user_id)
        .bind(&notification_create.title)
        .bind(&notification_create.message)
        .bind(&notification_create.url)
        .bind(&notification_create.time)
        .execute(&mut con)
        .await?;

    Ok(())
}
