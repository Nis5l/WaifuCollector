use serde::Serialize;

use crate::shared::user::data::Badge;

#[derive(Serialize)]
pub struct UserBadgesResponse {
    pub badges: Vec<Badge>
}
