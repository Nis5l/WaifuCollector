use serde::{Serialize, Deserialize};
use rocketjson::JsonBody;
use validator::Validate;

#[derive(Debug, Deserialize, Validate, JsonBody)]
#[serde(rename_all="camelCase")]
pub struct FriendAcceptRequest {
    pub user_id: i32
}

#[derive(Debug, Serialize)]
pub struct FriendAcceptResponse {
    pub message: String
}
