use serde::Serialize;
use sqlx::FromRow;

use crate::config::Config;
use crate::shared::Id;

#[derive(Debug, Serialize, FromRow)]
pub struct CardInfo {
    pub id: Id,
    #[sqlx(rename="cardName")]
    pub name: String,
    #[sqlx(rename="cardImage")]
    pub image: String
}

#[derive(Debug, Serialize)]
pub struct CardFrame {
    pub id: Id,
    pub name: String,
    pub front: String,
    pub back: String
}

#[derive(Debug, Serialize)]
pub struct CardType {
    pub id: Id,
    pub name: String
}

#[derive(Debug, Serialize)]
pub struct CardEffect {
    pub id: Id,
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
                image: card.card_image + &config.card_image_base
            },
            card_frame: CardFrame {
                id: card.frame_id,
                name: card.frame_name,
                front: card.frame_front + &config.frame_image_base,
                back: card.frame_back + &config.frame_image_base
            },
            card_type: CardType {
                id: card.type_id,
                name: card.type_name,
            },
            card_effect: CardEffect {
                id: card.effect_id,
                image: card.effect_image + &config.effect_image_base,
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

    pub card_id: Id,
    pub card_name: String,
    pub card_image: String,

    pub type_id: Id,
    pub type_name: String,

    pub frame_id: Id,
    pub frame_name: String,
    pub frame_front: String,
    pub frame_back: String,

    pub effect_id: Id,
    pub effect_image: String,
    pub effect_opacity: f32
}

#[derive(Debug, Serialize)]
pub struct CardCreateData {
    pub card_id: Id,
    pub frame_id: Id,
    pub quality: i32,
    pub level: i32
}
