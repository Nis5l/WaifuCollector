use serde::Serialize;

#[derive(Debug, Serialize)]
#[serde(rename_all="camelCase")]
pub struct PackTimeMaxResponse {
    pub pack_time_max: String
}
