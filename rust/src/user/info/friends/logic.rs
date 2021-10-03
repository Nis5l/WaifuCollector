use crate::sql::Sql;

use super::sql;
use super::data::{FriendsResponse, FriendStatus, FriendDb};

use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::http::Status;
use rocket::State;

#[get("/user/<id>/friends")]
pub async fn user_friends_route(sql: &State<Sql>, id: i32) -> ApiResponseErr<Vec<FriendsResponse>> {
    let friends_sent_raw = rjtry!(sql::get_user_friends(&sql, true, id).await);
    let mut friends_received_raw = rjtry!(sql::get_user_friends(&sql, false, id).await);

    let mut friends_raw = friends_sent_raw;
    friends_raw.append(&mut friends_received_raw);

    let friends = friends_raw.into_iter().filter_map(|friend: FriendDb| {
            let sent = friend.userone == id;
            let status = FriendStatus::from_database(sent, friend.friend_status);

            return match status {
                Some(v) => Some(FriendsResponse {
                    user_id: if sent { friend.usertwo } else { friend.userone },
                    username: friend.username,
                    status: v }),
                None => { 
                    println!("Friend status invalid");
                    None
                }
            }
        }).collect();

    ApiResponseErr::ok(Status::Ok, friends)
}
