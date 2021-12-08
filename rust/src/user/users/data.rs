use serde::{Serialize, Deserialize};
use validator::Validate;
use rocketjson::JsonBody;

use crate::shared::Id;

#[derive(Debug, Deserialize, Validate, JsonBody)]
pub struct UsersRequest {
    //TODO: default?
    pub username: Option<String>
}

#[derive(Serialize)]
pub struct UsersResponse {
    pub id: Id,
    pub username: String
}
