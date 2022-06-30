use serde::Serialize;
use crate::shared::Id;
use sqlx::FromRow;
use super::super::shared::Achievement;

//TODO: maybe use shared Collector struct later, if used anywhere else
#[derive(Debug, Serialize, FromRow)]
pub struct CollectorFavorites {
    pub id: Id,
    pub name: String
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UserStatsGlobalResponse {
    pub max_friends: u32,
    pub friends: i64,

    pub collector_favorites: Vec<CollectorFavorites>,

    pub achievements: Vec<Achievement>
}
