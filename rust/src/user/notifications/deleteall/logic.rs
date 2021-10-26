use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::http::Status;
use rocket::State;

use crate::sql::Sql;
use crate::crypto::JwtToken;
use super::sql;
use super::data::NotificationDeleteAllReponse;

#[post("/notifications/delete/all")]
pub async fn notifications_delete_all_route(sql: &State<Sql>, token: JwtToken) -> ApiResponseErr<NotificationDeleteAllReponse> {
    let user_id = token.id;

    let deleted_notifications = rjtry!(sql::delete_all_notifications(sql, user_id).await);

    ApiResponseErr::ok(Status::Ok, NotificationDeleteAllReponse {
        message: format!("Successfully deleted {} notifications", deleted_notifications)
    })
}
