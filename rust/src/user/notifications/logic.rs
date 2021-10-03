use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::http::Status;
use rocket::State;

use crate::sql::{Sql, model::Notification};
use crate::crypto::JwtToken;
use super::sql;

#[get("/notifications")]
pub async fn notifications_route(sql: &State<Sql>, token: JwtToken) -> ApiResponseErr<Vec<Notification>> {
    let notifications = rjtry!(sql::get_notifications(&sql, token.id).await);

    ApiResponseErr::ok(Status::Ok, notifications)
}
