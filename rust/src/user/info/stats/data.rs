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
    pub friends: i64,

    pub max_cards: i64,
    pub cards: i64,

    pub max_trades: i64,
    pub trades: i64,

    pub achievements: Vec<Achievement>
}
