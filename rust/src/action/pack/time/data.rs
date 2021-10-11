use serde::Serialize;

#[derive(Debug, Serialize)]
#[serde(rename_all="camelCase")]
pub struct PackTimeResponse {
    pub pack_time: String
}
