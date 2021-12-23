use serde::{Serialize, Deserialize};
use rocketjson::JsonBody;
use validator::Validate;

use crate::shared::Id;

#[derive(Debug, Deserialize, Validate, JsonBody)]
#[serde(rename_all="camelCase")]
pub struct FriendAcceptRequest {
    pub user_id: Id
}

#[derive(Debug, Serialize)]
pub struct FriendAcceptResponse {
    pub message: String
}
