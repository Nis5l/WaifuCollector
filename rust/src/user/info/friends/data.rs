use serde::Serialize;
use serde_repr::Serialize_repr;
use sqlx::FromRow;

#[derive(Serialize_repr)]
#[repr(i32)]
pub enum FriendStatus {
    Friend = 0,
    Pending = 1,
    Sent = 2
}

impl FriendStatus {
    pub fn from_database(sent: bool, status: i32) -> Option<Self> {
        match status {
            0 => return if sent { Some(FriendStatus::Sent) } else { Some(FriendStatus::Pending) },
            1 => return Some(FriendStatus::Friend),
            _ => None
        }
    }
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FriendsResponse {
    pub user_id: i32,
    pub username: String,
    pub status: FriendStatus
}

#[derive(Debug, Serialize, FromRow)]
pub struct FriendDb {
    pub username: String,
    pub userone: i32,
    pub usertwo: i32,
    #[sqlx(rename="friendStatus")]
    pub friend_status: i32
}
