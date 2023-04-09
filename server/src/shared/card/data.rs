use serde::{Serialize, Deserialize};
use sqlx::FromRow;
use rocket::form::FromFormField;

use crate::config::Config;
use crate::shared::{Id, IdInt};

#[derive(Debug, Serialize, FromRow)]
pub struct CardInfo {
    pub id: Id,
    #[sqlx(rename="cardName")]
    pub name: String,
}

#[derive(Debug, Serialize)]
pub struct CardFrame {
    pub id: IdInt,
    pub name: String,
    pub front: String,
    pub back: String
}

#[derive(Debug, Serialize, FromRow)]
#[serde(rename_all="camelCase")]
pub struct CardType {
    pub id: Id,
    pub name: String,
    #[sqlx(rename="userId")]
    pub user_id: Id,
}

#[derive(Debug, Serialize)]
pub struct CardEffect {
    pub id: IdInt,
    pub image: String,
    pub opacity: f32
}

#[derive(Debug, Serialize)]
#[serde(rename_all="camelCase")]
pub struct Card {
    pub id: Id,
    pub user_id: Id,
    pub level: i32,
    pub quality: i32,

    pub card_info: CardInfo,
    pub card_frame: CardFrame,
    pub card_type: CardType,
    pub card_effect: CardEffect
}

impl Card {
    pub fn from_card_db(card: CardDb, config: &Config) -> Self {
        Card {
            id: card.id,
            user_id: card.user_id,
            level: card.level,
            quality: card.quality,

            card_info: CardInfo {
                id: card.card_id,
                name: card.card_name,
            },
            card_frame: CardFrame {
                id: card.frame_id,
                name: card.frame_name,
                front: format!("{}/{}", &config.frame_image_base, card.frame_front),
                back: format!("{}/{}", &config.frame_image_base, card.frame_back)
            },
            card_type: CardType {
                id: card.type_id,
                name: card.type_name,
                user_id: card.card_type_user_id,
            },
            card_effect: CardEffect {
                id: card.effect_id,
                image: format!("{}/{}", &config.effect_image_base, card.effect_image),
                opacity: card.effect_opacity
            }
        }
    }
}

#[derive(Debug, Serialize, FromRow)]
#[serde(rename_all="camelCase")]
#[sqlx(rename_all = "camelCase")]
pub struct CardDb {
    pub id: Id,
    pub user_id: Id,
    pub level: i32,
    pub quality: i32,

    pub card_type_user_id: Id,
    pub card_id: Id,
    pub card_name: String,

    pub type_id: Id,
    pub type_name: String,

    pub frame_id: IdInt,
    pub frame_name: String,
    pub frame_front: String,
    pub frame_back: String,

    pub effect_id: IdInt,
    pub effect_image: String,
    pub effect_opacity: f32
}

#[derive(Debug, Serialize)]
pub struct CardCreateData {
    pub card_id: Id,
    pub frame_id: IdInt,
    pub quality: i32,
    pub level: i32
}

#[derive(Debug, FromFormField)]
pub enum CardState {
    #[field(value = "0")]
    Requested = 0,
    #[field(value = "1")]
    Created = 1,
}

impl<'de> Deserialize<'de> for CardState {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
       where D: serde::Deserializer<'de> {
            let i = i32::deserialize(deserializer)?;

            Ok(match i {
                0 => Self::Requested,
                _ => Self::Created
            })
       }
}

#[derive(Debug)]
pub enum SortType {
    Name = 0,
    Level = 1,
    Recent = 2
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

pub struct InventoryOptions {
    pub user_id: Id,
    pub collector_id: Id,
    pub count: u32,
    pub offset: u32,
    pub search: String,
    pub exclude_uuids: Vec<Id>,
    pub sort_type: SortType,
    pub level: Option<i32>,
    pub card_id: Option<Id>
}
