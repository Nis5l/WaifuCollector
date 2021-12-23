use serde::{Serialize, Deserialize};
use rocketjson::JsonBody;
use validator::Validate;

use crate::shared::Id;

#[derive(Debug, Deserialize, Validate, JsonBody)]
#[serde(rename_all="camelCase")]
pub struct GiveCardRequest {
    pub user_id: Id,
    pub card_id: Id,
    pub frame_id: Id,
    pub quality: i32,
    pub level: i32
}

#[derive(Debug, Serialize)]
pub struct GiveCardResponse {
    pub uuid: Id
}
