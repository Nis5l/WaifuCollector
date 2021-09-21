use crate::sql::{Sql, model::Notification};
use crate::config::Config;
use crate::crypto::JwtToken;

use super::sql;

use rocketjson::{ApiResponseErr, rjtry};
use rocket::http::Status;

//TODO: change to get
#[post("/notifications")]
pub async fn notifications_user(sql: Sql, config: &rocket::State<Config>, token: JwtToken) -> ApiResponseErr<Vec<Notification>> {
    //TODO: use token
    let notifications = rjtry!(sql::get_notifications(&sql, 0).await);

    ApiResponseErr::ok(Status::Ok, notifications)
}
