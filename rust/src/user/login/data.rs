use serde::{Serialize, Deserialize};
use validator::Validate;
use rocketjson::JsonBody;
use sqlx::FromRow;

#[derive(Debug, Deserialize, Validate, JsonBody)]
pub struct LoginRequest {
    pub username: String,
    pub password: String
}

#[derive(Serialize)]
pub struct LoginResponse {
    pub token: String
}

#[derive(Debug, FromRow)]
pub struct LoginDb {
    pub id: i32,
    pub username: String,
    pub password: String
}
