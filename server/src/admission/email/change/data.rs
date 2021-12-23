use rocketjson::JsonBody;
use serde::{Deserialize, Serialize};
use validator::Validate;

#[derive(Debug, Deserialize, Validate, JsonBody)]
pub struct EmailChangeRequest {
    #[validate(email)]
    pub email: String
}

#[derive(Debug, Serialize)]
pub struct EmailChangeResponse {
    pub message: String
}
