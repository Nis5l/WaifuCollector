use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::State;
use rocket::http::Status;
use chrono::Utc;

use super::data::{FriendAcceptRequest, FriendAcceptResponse};
use super::sql;
use crate::shared::crypto::JwtToken;
use crate::shared::notification;
use crate::sql::Sql;
use crate::verify_user;

#[post("/friend/accept", data="<data>")]
pub async fn friend_accept_route(data: FriendAcceptRequest, token: JwtToken, sql: &State<Sql>) -> ApiResponseErr<FriendAcceptResponse> {
    let JwtToken { id: user_id, username } = token;
    let accept_id = data.user_id;

    verify_user!(sql, &user_id, true);
    let accept_username = verify_user!(sql, &accept_id, false);

    if !rjtry!(sql::accept_friend_request(sql, &user_id, &accept_id).await) {
        return ApiResponseErr::api_err(Status::NotFound, format!("No friend request by user {}", &accept_id));
    }

    rjtry!(notification::sql::add_notification(sql, &accept_id, None, &notification::data::NotificationCreateData {
        title: String::from("Friend Request Accepted"),
        message: format!("{} accepted your friend request, click to view!", username),
        url: String::from("dashboard"),
        time: Utc::now()
    }).await);

    ApiResponseErr::ok(Status::Ok, FriendAcceptResponse {
        message: format!("Accepted friend request from {}", accept_username)
    })
}
