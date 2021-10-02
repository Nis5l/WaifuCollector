use crate::sql::Sql;
use crate::crypto::JwtToken;

use super::sql;
use super::data::{FriendsRequest, FriendsResponse};

use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::http::Status;
use rocket::State;

#[get("/friends", data="<data>")]
pub async fn friends_route(sql: &State<Sql>, data: FriendsRequest, token: JwtToken) -> ApiResponseErr<Vec<FriendsResponse>> {
    //TODO: friend_status enum
    /*
    let friends_raw = rjtry!(sql::get_friends(&sql, token.id).await);

    let friends = friends_raw.into_iter().map(|friend| {
            if token.id == friend.userone {
                if friend.friend_status == 0 {
                    return FriendsResponse::new(friend.usertwo, friend.username, 1);
                }

                return FriendsResponse::new(friend.usertwo, friend.username, friend.friend_status);
            }

            return FriendsResponse::new(friend.userone, friend.username, friend.friend_status);
        }).collect();
    */

    ApiResponseErr::ok(Status::Ok, Vec::new())
}
