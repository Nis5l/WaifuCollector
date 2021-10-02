use serde::{Serialize, Deserialize};
use validator::Validate;
use rocketjson::JsonBody;
use sqlx::FromRow;

#[derive(Debug, Deserialize, Validate, JsonBody)]
pub struct FriendsRequest {
    id: i32
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FriendsResponse {
    user_id: i32,
    username: String,
    status: i32
}

impl FriendsResponse {
    pub fn new(user_id: i32, username: String, status: i32) -> Self {
        FriendsResponse {
            user_id,
            status,
            username
        }
    }
}

#[derive(Debug, Serialize, FromRow)]
pub struct FriendDb {
    pub username: String,
    pub userone: i32,
    pub usertwo: i32,
    pub friend_status: i32
}
