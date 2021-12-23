use rocketjson::JsonBody;
use validator::Validate;
use serde::{Serialize, Deserialize};

use crate::shared::Id;

#[derive(Debug, Deserialize, Validate, JsonBody)]
#[serde(rename_all="camelCase")]
pub struct FriendAddRequest {
    pub user_id: Option<Id>,
    pub username: Option<String>
}

#[derive(Debug, Serialize)]
pub struct FriendAddResponse {
    pub message: String
}
