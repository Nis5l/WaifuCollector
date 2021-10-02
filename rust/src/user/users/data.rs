use serde::{Serialize, Deserialize};
use validator::Validate;
use rocketjson::JsonBody;

#[derive(Debug, Deserialize, Validate, JsonBody)]
pub struct UsersRequest {
    pub username: Option<String>
}

#[derive(Serialize)]
pub struct UsersResponse {
    pub id: i32,
    pub username: String
}

impl UsersResponse {
    pub fn new(username: String, id: i32) -> Self {
        UsersResponse {
            username,
            id
        }
    }
}
