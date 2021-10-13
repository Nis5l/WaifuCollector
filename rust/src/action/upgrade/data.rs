use serde::{Serialize, Deserialize};
use rocketjson::JsonBody;
use validator::Validate;
use crate::shared::card::data::CardCreateData;

#[derive(Debug, Serialize)]
pub struct UpgradeResponse {
    pub uuid: i32,
    pub success: bool
}

#[derive(Debug, Serialize, Deserialize, Validate, JsonBody)]
#[serde(rename_all="camelCase")]
pub struct UpgradeRequest {
    pub card_one: i32,
    pub card_two: i32
}

pub struct UpgradeCardsResult {
    pub success: bool,
    pub create_card_data: CardCreateData
}

