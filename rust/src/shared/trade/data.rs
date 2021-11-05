use serde_repr::{Serialize_repr, Deserialize_repr};

#[derive(Debug, Clone, Copy, Serialize_repr, Deserialize_repr)]
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
