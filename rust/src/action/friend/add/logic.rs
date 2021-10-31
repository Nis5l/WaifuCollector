use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::http::Status;
use rocket::State;
use chrono::Utc;

use super::data::{FriendAddResponse, FriendAddRequest};
use super::sql;
use crate::shared::{user, friend, notification};
use crate::sql::Sql;
use crate::crypto::JwtToken;
use crate::config::Config;

#[post("/friend/add", data="<data>")]
pub async fn friend_add_route(data: FriendAddRequest, sql: &State<Sql>, token: JwtToken, config: &State<Config>) -> ApiResponseErr<FriendAddResponse> {
    let user_id = token.id;

    if data.user_id.is_none() && data.username.is_none() {
        return ApiResponseErr::api_err(Status::BadRequest, String::from("One of the fields has to be set: userId, username"));
    }

    let user_id_receiver = match data.user_id {
                    Some(id) => {
                        println!("{}", rjtry!(user::sql::user_id_exists(sql, id).await));
                        if !rjtry!(user::sql::user_id_exists(sql, id).await) {
                            return ApiResponseErr::api_err(Status::Conflict, format!("User with id {} does not exist", id));
                        }
                        id
                    },
                    None => {
                        let username = data.username.unwrap();
                        let user_id_opt = rjtry!(user::sql::user_id_from_username(sql, &username).await);

                        match user_id_opt {
                            None => return ApiResponseErr::api_err(Status::NotFound, format!("User \"{}\" not found", username)),
                            Some(id) => id
                        }
                    }
                };

    if user_id_receiver == user_id {
        return ApiResponseErr::api_err(Status::Conflict, String::from("Can not add yourself"));
    }

    if rjtry!(friend::sql::used_friend_slots(sql, user_id).await) >= config.max_friends as i64 {
        return ApiResponseErr::api_err(Status::Conflict, format!("Reached friend limit of {}", config.max_friends));
    }

    if rjtry!(friend::sql::user_friend(sql, user_id, user_id_receiver).await).is_some() {
        return ApiResponseErr::api_err(Status::Conflict, format!("Friend response already sent by or to {}", user_id));
    }

    rjtry!(sql::send_friend_request(sql, user_id, user_id_receiver).await);

    rjtry!(notification::sql::add_notification(sql, user_id_receiver, &notification::data::NotificationCreateData {
        title: String::from("Friend Request"),
        message: String::from("You got a new friend request, click to view!"),
        url: String::from("friends"),
        time: Utc::now()
    }).await);

    ApiResponseErr::ok(Status::Ok, FriendAddResponse { message: format!("Sent friend request to {}", user_id_receiver) })
}
