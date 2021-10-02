use serde::Serialize;

#[derive(Serialize)]
pub struct Friend {
    pub id: i32,
    pub userone: i32,
    pub usertwo: i32,
    pub friend_status: i32
}
