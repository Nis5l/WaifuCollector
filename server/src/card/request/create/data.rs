use serde::{Serialize, Deserialize};
use validator::Validate;
use rocketjson::JsonBody;

use crate::shared::Id;

#[derive(Debug, Deserialize, Validate, JsonBody)]
pub struct CardRequestRequest {
    pub name: String,
    pub card_type: Id,
    pub user_id: Id,
}

#[derive(Debug, Serialize)]
pub struct CardRequestResponse {
    pub id: Id,
}
