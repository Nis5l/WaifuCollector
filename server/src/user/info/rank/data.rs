use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct UserRankResponse {
    pub rank: i32
}
