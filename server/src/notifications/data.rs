use serde::Serialize;
use sqlx::FromRow;
use chrono::{DateTime, Utc};

use crate::shared::Id;

#[derive(Debug, Serialize, FromRow)]
pub struct Notification {
    pub id: Id,
    #[sqlx(rename = "userId")]
    pub user_id: Id,
    pub title: String,
    pub message: String,
    pub url: String,
    pub time: DateTime<Utc>
}

#[derive(Debug, Serialize)]
pub struct NotificationResponse {
    pub notifications: Vec<Notification>
}
