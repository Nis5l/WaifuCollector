use serde::Serialize;
use chrono::{DateTime, Utc};
use sqlx::FromRow;

use crate::shared::card::data::Card;
use crate::shared::trade::data::TradeStatus;

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
