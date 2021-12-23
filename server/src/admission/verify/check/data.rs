use serde::Serialize;
use sqlx::FromRow;

use crate::shared::user::data::UserVerified;

#[derive(Debug, Serialize)]
pub struct VerifiedResponse {
    pub verified: UserVerified,
    pub email: Option<String>
}
