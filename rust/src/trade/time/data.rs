use serde::Serialize;
use chrono::{DateTime, Utc};

#[derive(Debug, Serialize)]
#[serde(rename_all="camelCase")]
pub struct TradeTimeResponse {
    pub trade_time: DateTime<Utc>
}
