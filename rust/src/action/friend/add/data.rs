use rocketjson::JsonBody;
use validator::Validate;
use serde::{Serialize, Deserialize};

#[derive(Debug, Deserialize, Validate, JsonBody)]
#[serde(rename_all="camelCase")]
pub struct FriendAddRequest {
    pub user_id: Option<i32>,
    pub username: Option<String>
}

#[derive(Debug, Serialize)]
pub struct FriendAddResponse {
    pub message: String
}
