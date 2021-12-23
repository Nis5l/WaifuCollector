use serde_repr::{Serialize_repr, Deserialize_repr};
use sqlx::FromRow;
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Copy, Serialize_repr, Deserialize_repr)]
#[repr(i32)]
pub enum TradeStatus {
    UnConfirmed = 0,
    Confirmed = 1
}

impl TradeStatus {
    //TODO: there has to be a better method working with serde
    pub fn from_int(status: i32) -> Result<Self, ()> {
        match status {
            0 => Ok(TradeStatus::UnConfirmed),
            1 => Ok(TradeStatus::Confirmed),
            _ => Err(())
        }
    }
}

#[derive(Debug, FromRow)]
pub struct TradeDb {
    #[sqlx(rename="lastTrade")]
    pub last_trade: Option<DateTime<Utc>>,
    #[sqlx(rename="selfStatus")]
    pub self_status: i32,
    #[sqlx(rename="friendStatus")]
    pub friend_status: i32
}

