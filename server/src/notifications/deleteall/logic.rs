use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::http::Status;
use rocket::State;

use crate::sql::Sql;
use crate::shared::crypto::JwtToken;
use crate::verify_user;
use super::sql;
use super::data::NotificationDeleteAllReponse;

#[post("/notifications/delete/all")]
pub async fn notifications_delete_all_route(sql: &State<Sql>, token: JwtToken) -> ApiResponseErr<NotificationDeleteAllReponse> {
    let user_id = token.id;

    verify_user!(sql, &user_id);

    let deleted_notifications = rjtry!(sql::delete_all_notifications(sql, &user_id).await);

    ApiResponseErr::ok(Status::Ok, NotificationDeleteAllReponse {
        message: format!("Successfully deleted {} notifications", deleted_notifications)
    })
}
