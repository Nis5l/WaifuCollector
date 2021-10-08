use serde::Serialize;
use crate::shared::card::Card;

#[derive(Debug, Serialize)]
pub struct PackOpenResponse {
    cards: Vec<Card>
}
