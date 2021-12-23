use chrono::{DateTime, Utc};

pub struct NotificationCreateData {
    pub title: String,
    pub message: String,
    pub url: String,
    pub time: DateTime<Utc>
}
