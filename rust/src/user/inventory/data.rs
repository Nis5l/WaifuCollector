use serde::Deserialize;
use rocketjson::JsonBody;
use validator::Validate;

use crate::shared::Id;

#[derive(Debug)]
pub enum SortType {
    Name = 0,
    Level = 1, Recent = 2
}

impl Default for SortType {
    fn default() -> Self {
        Self::Name
    }
}

impl<'de> Deserialize<'de> for SortType {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
       where D: serde::Deserializer<'de> {
            let i = i32::deserialize(deserializer)?;

            Ok(match i {
                1 => Self::Level,
                2 => Self::Recent,
                _ => Self::Name
            })
       }
}

#[derive(Debug, Deserialize, Validate, JsonBody)]
#[serde(rename_all="camelCase")]
pub struct InventoryFriendRequest {
    pub friend_id: Id,
    #[serde(default)]
    pub exclude_suggestions: bool
}

#[derive(Debug, Deserialize, Validate, JsonBody)]
#[serde(rename_all="camelCase")]
pub struct InventoryRequest {
    #[serde(default)]
    pub page: u32,
    #[serde(default)]
    pub search: String,
    #[serde(default)]
    pub exclude_uuids: Vec<Id>,
    #[serde(default)]
    pub sort_type: SortType,
    pub level: Option<i32>,
    pub card_id: Option<Id>,
    pub friend: Option<InventoryFriendRequest>
}

pub struct InventoryOptions {
    pub user_id: Id,
    pub count: u32,
    pub offset: u32,
    pub search: String,
    pub exclude_uuids: Vec<Id>,
    pub sort_type: SortType,
    pub level: Option<i32>,
    pub card_id: Option<Id>
}
