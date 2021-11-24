use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct MailGetResponse {
    pub email: Option<String>
}
