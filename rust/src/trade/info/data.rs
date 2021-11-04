use serde::Serialize;
use serde_repr::{Serialize_repr, Deserialize_repr};
use chrono::{DateTime, Utc};
use sqlx::FromRow;

use crate::shared::card::data::Card;

#[derive(Debug, Serialize_repr, Deserialize_repr)]
#[repr(i32)]
pub enum TradeStatus {
    UnConfirmed = 0,
    Confirmed = 1
}

impl TradeStatus {
    //TODO: there has to be a better method working with serde
    pub fn from_int(status: i32) -> Option<Self> {
        match status {
            0 => Some(TradeStatus::Confirmed),
            1 => Some(TradeStatus::UnConfirmed),
            _ => None
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

#[derive(Debug, Serialize)]
#[serde(rename_all="camelCase")]
pub struct TradeResponse {
    pub self_cards: Vec<Card>,
    pub friend_cards: Vec<Card>,
    pub self_card_suggestions: Vec<Card>,
    pub friend_card_suggestions: Vec<Card>,
    pub friend_username: String,
    pub self_status: TradeStatus,
    pub friend_status: TradeStatus,
    pub trade_card_limit: u32,
    pub trade_time: DateTime<Utc>
}
