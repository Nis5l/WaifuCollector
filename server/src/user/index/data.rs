use serde::Serialize;

use crate::shared::Id;
use crate::shared::user::data::Badge;

#[derive(Serialize)]
pub struct UsersResponse {
    pub id: Id,
    pub username: String,
    pub badges: Vec<Badge>
}
