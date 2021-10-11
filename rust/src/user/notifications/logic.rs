use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::http::Status;
use rocket::State;

use crate::sql::Sql;
use crate::crypto::JwtToken;
use super::sql;
use super::data::NotificationResponse;

#[get("/notifications")]
pub async fn notifications_route(sql: &State<Sql>, token: JwtToken) -> ApiResponseErr<NotificationResponse> {
    let notifications = rjtry!(sql::get_notifications(&sql, token.id).await);

    ApiResponseErr::ok(Status::Ok, NotificationResponse {
        notifications
    })
}
