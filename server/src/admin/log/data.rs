use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct AdminLogResponse {
    pub log: String
}
