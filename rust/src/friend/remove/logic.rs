use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::State;
use rocket::http::Status;
use chrono::Utc;

use super::data::{FriendRemoveRequest, FriendRemoveResponse};
use super::sql;
use crate::shared::{user, notification};
use crate::sql::Sql;
use crate::crypto::JwtToken;

#[post("/friend/remove", data="<data>")]
pub async fn friend_remove_route(data: FriendRemoveRequest, sql: &State<Sql>, token: JwtToken) -> ApiResponseErr<FriendRemoveResponse> {
    let user_id = token.id;
    let username = token.username;

    let (user_id_remove, username_remove) = match rjtry!(user::sql::username_from_user_id(sql, data.user_id).await) {
        None => return ApiResponseErr::api_err(Status::NotFound, format!("User with id {} not found", data.user_id)),
        Some(username) => (data.user_id, username)
    };

    if !rjtry!(sql::remove_friend(sql, user_id, user_id_remove).await) {
        return ApiResponseErr::api_err(Status::Conflict, format!("Not friend with {}", username_remove));
    }

    //TODO: clear trade

    rjtry!(notification::sql::add_notification(sql, user_id_remove, &notification::data::NotificationCreateData {
        title: String::from("Friend Removed"),
        message: format!("{} removed you as a friend", username),
        url: String::from("friends"),
        time: Utc::now()
    }).await);

    ApiResponseErr::ok(Status::Ok, FriendRemoveResponse {
        message: format!("Removed {} as a friend", username_remove)
    })
}
