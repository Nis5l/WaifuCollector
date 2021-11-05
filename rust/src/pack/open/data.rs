use serde::Serialize;
use sqlx::FromRow;
use chrono::{DateTime, Utc};

use crate::shared::Id;
use crate::shared::card::data::Card;

#[derive(Debug, Serialize, FromRow)]
#[sqlx(rename_all="camelCase")]
pub struct CardCreateDataDb {
    pub card_id: Id,
    pub frame_id: Id
}

#[derive(Debug, Serialize)]
pub struct PackOpenResponse {
    pub cards: Vec<Card>
}

pub enum CanOpenPack {
    Yes,
    No(DateTime<Utc>)
}
