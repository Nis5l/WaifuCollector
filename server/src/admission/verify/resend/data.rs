use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct VerifyResendResponse {
    pub message: String
}
