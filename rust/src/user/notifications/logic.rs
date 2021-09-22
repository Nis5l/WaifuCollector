use crate::sql::{Sql, model::Notification};
use crate::crypto::JwtToken;

use super::sql;

use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::http::Status;

//TODO: change to get
#[post("/notifications")]
pub async fn notifications_user(sql: Sql, token: JwtToken) -> ApiResponseErr<Vec<Notification>> {
    let notifications = rjtry!(sql::get_notifications(&sql, token.id).await);

    ApiResponseErr::ok(Status::Ok, notifications)
}
