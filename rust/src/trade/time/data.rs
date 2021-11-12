use serde::Serialize;
use chrono::{DateTime, Utc};

#[derive(Debug, Serialize)]
pub struct TradeTimeResponse {
    pub trade_time: DateTime<Utc>
}
