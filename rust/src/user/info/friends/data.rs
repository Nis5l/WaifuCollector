use serde::Serialize;

use crate::shared::friend::data::FriendStatus;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FriendsResponse {
    pub user_id: i32,
    pub username: String,
    pub status: FriendStatus
}
