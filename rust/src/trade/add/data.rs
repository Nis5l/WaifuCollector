use serde::{Serialize, Deserialize};
use validator::Validate;
use rocketjson::JsonBody;

use crate::shared::Id;

#[derive(Debug, Deserialize, Validate, JsonBody)]
#[serde(rename_all="camelCase")]
pub struct TradeAddRequest {
    pub user_id: Id,
    pub card: Id
}

#[derive(Debug, Serialize)]
pub struct TradeAddResponse {
    pub message: String
}
