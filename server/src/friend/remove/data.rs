use serde::{Serialize, Deserialize};
use validator::Validate;
use rocketjson::JsonBody;

use crate::shared::Id;

#[derive(Debug, Deserialize, Validate, JsonBody)]
#[serde(rename_all="camelCase")]
pub struct FriendRemoveRequest {
    pub user_id: Id
}

#[derive(Debug, Serialize)]
pub struct FriendRemoveResponse {
    pub message: String
}
