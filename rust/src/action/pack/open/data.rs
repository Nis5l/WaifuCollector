use serde::Serialize;
use crate::shared::card::data::Card;
use sqlx::FromRow;
use chrono::{DateTime, Utc};

#[derive(Debug, Serialize, FromRow)]
#[sqlx(rename_all="camelCase")]
pub struct CardCreateDataDb {
    pub card_id: i32,
    pub frame_id: i32
}

#[derive(Debug, Serialize)]
pub struct PackOpenResponse {
    pub cards: Vec<Card>
}

pub enum CanOpenPack {
    Yes,
    No(DateTime<Utc>)
}
