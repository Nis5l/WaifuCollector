use serde::Serialize;
use sqlx::FromRow;
use chrono::{DateTime, Utc};

use crate::shared::{Id, IdInt};
use crate::shared::card::data::UnlockedCard;

#[derive(Debug, Serialize, FromRow)]
#[sqlx(rename_all="camelCase")]
pub struct CardCreateDataDb {
    pub card_id: Id,
    pub frame_id: IdInt
}

#[derive(Debug, Serialize)]
pub struct PackOpenResponse {
    pub cards: Vec<UnlockedCard>
}

pub enum CanOpenPack {
    Yes,
    No(DateTime<Utc>)
}
