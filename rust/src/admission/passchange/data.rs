use serde::{Serialize, Deserialize};
use rocketjson::JsonBody;
use validator::Validate;

use crate::config::Config;
use crate::shared::user::data::validate_password;

#[derive(Debug, Deserialize, JsonBody, Validate)]
#[serde(rename_all="camelCase")]
pub struct PassChangeRequest {
    #[validate(custom(function="validate_password", arg="&'v_a Config"))]
    pub new_password: String
}

#[derive(Debug, Serialize)]
pub struct PassChangeResponse {
    pub message: String
}
