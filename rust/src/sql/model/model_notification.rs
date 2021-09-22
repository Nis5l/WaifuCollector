use serde::Serialize;

#[derive(Queryable, Serialize)]
pub struct Notification {
    pub id: i32,
    pub user_id: i32,
    pub title: String,
    pub messge: String,
    pub url: String,
    pub time: i64
}
