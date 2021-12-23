use serde::Serialize;
use validator::Validate;

#[derive(Debug, Serialize, Validate)]
pub struct UserUsernameResponse {
    pub username: String
}
