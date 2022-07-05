use rocketjson::JsonBody;
use validator::Validate;
use serde::{Serialize, Deserialize};

use crate::shared::Id;

#[derive(Debug, Deserialize, Validate, JsonBody)]
pub struct CollectorCreateRequest {
    pub name: String
}

#[derive(Debug, Serialize)]
pub struct CollectorCreateResponse {
    pub id: Id
}
