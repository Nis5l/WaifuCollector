use serde::{Serialize, Deserialize};
use validator::Validate;
use rocketjson::JsonBody;

#[derive(Debug, Deserialize, Validate, JsonBody)]
#[serde(rename_all="camelCase")]
pub struct FriendRemoveRequest {
    pub user_id: i32
}

#[derive(Debug, Serialize)]
pub struct FriendRemoveResponse {
    pub message: String
}
