use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::http::Status;
use rocket::State;

use crate::sql::Sql;
use crate::crypto::JwtToken;
use crate::verify_user;
use super::sql;
use super::data::NotificationResponse;

#[get("/notifications")]
pub async fn notifications_route(sql: &State<Sql>, token: JwtToken) -> ApiResponseErr<NotificationResponse> {
    let user_id = token.id;

    verify_user!(sql, user_id);

    let notifications = rjtry!(sql::get_notifications(&sql, token.id).await);

    ApiResponseErr::ok(Status::Ok, NotificationResponse {
        notifications
    })
}