use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::State;
use rocket::http::Status;
use chrono::Utc;

use super::data::{FriendAcceptRequest, FriendAcceptResponse};
use super::sql;
use crate::shared::crypto::JwtToken;
use crate::shared::{user, notification};
use crate::sql::Sql;
use crate::verify_user;

#[post("/friend/accept", data="<data>")]
pub async fn friend_accept_route(data: FriendAcceptRequest, token: JwtToken, sql: &State<Sql>) -> ApiResponseErr<FriendAcceptResponse> {
    let JwtToken { id: user_id, username } = token;

    verify_user!(sql, &user_id);

    let (user_id_accept, username_accept) = match rjtry!(user::sql::username_from_user_id(sql, &data.user_id).await) {
        None => return ApiResponseErr::api_err(Status::NotFound, format!("User with id {} not found", data.user_id)),
        Some(username) => (data.user_id, username)
    };

    if !rjtry!(sql::accept_friend_request(sql, &user_id, &user_id_accept).await) {
        return ApiResponseErr::api_err(Status::NotFound, format!("No friend request by user {}", &user_id_accept));
    }

    rjtry!(notification::sql::add_notification(sql, &user_id_accept, &notification::data::NotificationCreateData {
        title: String::from("Friend Request Accepted"),
        message: format!("{} accepted your friend request, click to view!", username),
        url: String::from("dashboard"),
        time: Utc::now()
    }).await);

    ApiResponseErr::ok(Status::Ok, FriendAcceptResponse {
        message: format!("Accepted friend request from {}", username_accept)
    })
}
