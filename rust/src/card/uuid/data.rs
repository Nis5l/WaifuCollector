use serde::Serialize;
use crate::shared::card::data::Card;

#[derive(Debug, Serialize)]
pub struct CardUuidResponse {
    pub card: Card
}
