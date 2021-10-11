use serde::Serialize;
use sqlx::FromRow;

#[derive(Debug, Serialize, FromRow)]
pub struct Notification {
    pub id: i32,
    #[sqlx(rename = "userId")]
    pub user_id: i32,
    pub title: String,
    pub message: String,
    pub url: String,
    pub time: i64
}

#[derive(Debug, Serialize)]
pub struct NotificationResponse {
    pub notifications: Vec<Notification>
}
