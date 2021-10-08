use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct Achievement {
    pub image: String,
    pub text: String
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UserStatsResponse {
    pub max_friends: u32,
    pub friends: u32,

    pub max_cards: u32,
    pub cards: u32,

    pub max_trades: u32,
    pub trades: u32,

    pub achievements: Vec<Achievement>
}
