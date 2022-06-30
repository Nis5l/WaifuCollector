use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::State;
use rocket::http::Status;
use chrono::Utc;

use super::data::{FriendRemoveRequest, FriendRemoveResponse};
use super::sql;
use crate::shared::notification;
use crate::sql::Sql;
use crate::shared::crypto::JwtToken;
use crate::verify_user;

#[post("/friend/remove", data="<data>")]
pub async fn friend_remove_route(data: FriendRemoveRequest, sql: &State<Sql>, token: JwtToken) -> ApiResponseErr<FriendRemoveResponse> {
    let JwtToken { id: user_id, username } = token;
    let friend_id = data.user_id;

    verify_user!(sql, &user_id, true);
    let friend_username = verify_user!(sql, &friend_id, false);

    if !rjtry!(sql::remove_friend(sql, &user_id, &friend_id).await) {
        return ApiResponseErr::api_err(Status::Conflict, format!("Not friend with {}", &friend_username));
    }

    //TODO: clear trade

    rjtry!(notification::sql::add_notification(sql, &friend_id, None, &notification::data::NotificationCreateData {
        title: String::from("Friend Removed"),
        message: format!("{} removed you as a friend", &username),
        url: String::from("friends"),
        time: Utc::now()
    }).await);

    ApiResponseErr::ok(Status::Ok, FriendRemoveResponse {
        message: format!("Removed {} as a friend", &friend_username)
    })
}
