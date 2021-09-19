use serde::{Serialize, Deserialize};
use validator::Validate;
use rocketjson::JsonBody;

#[derive(Debug, Deserialize, Validate, JsonBody)]
pub struct LoginRequest {
    pub username: String,
    pub password: String
}

#[derive(Serialize)]
pub struct LoginResponse {
    token: String
}

impl LoginResponse {
    pub fn new(token: String) -> Self {
        LoginResponse {
            token
        }
    }
}
