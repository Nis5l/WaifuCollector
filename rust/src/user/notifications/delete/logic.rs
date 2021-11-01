use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::http::Status;
use rocket::State;

use crate::sql::Sql;
use crate::crypto::JwtToken;
use crate::shared::Id;
use super::sql;
use super::data::NotificationDeleteReponse;

#[post("/notifications/delete/<notification_id>")]
pub async fn notifications_delete_route(sql: &State<Sql>, notification_id: Id, token: JwtToken) -> ApiResponseErr<NotificationDeleteReponse> {
    let user_id = token.id;

    let result = rjtry!(sql::delete_notification(sql, user_id, notification_id).await);

    match result {
        true => ApiResponseErr::ok(Status::Ok, NotificationDeleteReponse {
            message: String::from("Successfully deleted notification")
        }),
        false => ApiResponseErr::ok(Status::NotFound, NotificationDeleteReponse {
            message: format!("No notificaion with id {} found", notification_id)
        })
    }

}
