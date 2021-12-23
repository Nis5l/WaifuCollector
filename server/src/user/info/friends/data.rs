use serde::Serialize;

use crate::shared::friend::data::FriendStatus;
use crate::shared::Id;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FriendsResponse {
    pub user_id: Id,
    pub username: String,
    pub status: FriendStatus
}
