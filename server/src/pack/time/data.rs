use serde::Serialize;
use chrono::{DateTime, Utc};

#[derive(Debug, Serialize)]
#[serde(rename_all="camelCase")]
pub struct PackTimeResponse {
    pub pack_time: DateTime<Utc>
}
