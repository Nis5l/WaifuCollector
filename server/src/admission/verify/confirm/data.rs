use serde::Serialize;
use sqlx::FromRow;

#[derive(Debug, Serialize)]
pub struct VerifyConfirmResponse {
    pub message: String
}

#[derive(Debug, FromRow)]
pub struct VerifiedKeyDb {
    #[sqlx(rename="uverified")]
    pub verified: i32,
    #[sqlx(rename="ukey")]
    pub key: String
}
