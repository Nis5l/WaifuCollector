use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct EmailDeleteResponse {
    pub message: String
}
