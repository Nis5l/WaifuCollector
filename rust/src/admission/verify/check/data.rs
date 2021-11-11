use serde::Serialize;
use sqlx::FromRow;

use crate::shared::user::data::UserVerified;

#[derive(Debug, FromRow)]
pub struct VerifiedDb {
    #[sqlx(rename="uverified")]
    pub verified: i32,
    #[sqlx(rename="uemail")]
    pub email: Option<String>
}

#[derive(Debug, Serialize)]
pub struct VerifiedResponse {
    pub verified: UserVerified,
    pub email: Option<String>
}
