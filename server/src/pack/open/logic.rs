use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::http::Status;
use rocket::State;
use chrono::{DateTime, Utc, Duration};
use rand::{thread_rng, Rng};
use std::ops::RangeInclusive;
use std::sync::Arc;
use tokio::sync::Mutex;

use super::data::{PackOpenResponse, CanOpenPack};
use super::sql;
use super::super::shared;
use crate::shared::crypto::{JwtToken, random_string::generate_random_string};
use crate::sql::Sql;
use crate::config::Config;
use crate::shared::card::{self, data::CardCreateData};
use crate::verify_user;
use crate::shared::card::packstats::data::PackStats;

#[post("/pack/open")]
pub async fn pack_open_route(sql: &State<Sql>, token: JwtToken, config: &State<Config>, pack_stats: &State<Arc<Mutex<PackStats>>>) -> ApiResponseErr<PackOpenResponse> {
    let user_id = token.id;

    verify_user!(sql, &user_id, true);

    let last_opened = rjtry!(shared::sql::get_pack_time(sql, &user_id).await);

    if let CanOpenPack::No(next_time) = can_open_pack(last_opened, config.pack_cooldown) {
        return ApiResponseErr::api_err(Status::Conflict, format!("Wait until: {}", next_time));
    }

    let cards_create_data = rjtry!(get_random_cards(sql, config.pack_amount, config.pack_quality_min..=config.pack_quality_max).await);

    let mut inserted_cards_uuids = Vec::new();
    for card_create_data in cards_create_data.iter() {
        let inserted_card_uuid = generate_random_string(config.id_length);
        rjtry!(card::sql::add_card(&sql, &user_id, &inserted_card_uuid, card_create_data).await);
        inserted_cards_uuids.push(inserted_card_uuid);
    }

    rjtry!(sql::set_pack_time(&sql, &user_id, Utc::now()).await);

    let cards = rjtry!(card::sql::get_cards(&sql, inserted_cards_uuids, None, config).await);

    rjtry!(PackStats::add_pack_stats(pack_stats.inner().clone(), config.pack_amount as i32).await);

    ApiResponseErr::ok(Status::Ok, PackOpenResponse {
        cards
    })
}

fn can_open_pack(last_opened: Option<DateTime<Utc>>, pack_cooldown: u32) -> CanOpenPack {
    match last_opened {
        None => {
            return CanOpenPack::Yes;
        },
        Some(time) => {
            let next_time = time + Duration::seconds(pack_cooldown as i64);
            if Utc::now() >= next_time {
                return CanOpenPack::Yes;
            }
            return CanOpenPack::No(next_time);
        }
    }
}

async fn get_random_cards(sql: &Sql, amount: u32, quality_range: RangeInclusive<i32>) -> Result<Vec<CardCreateData>, sqlx::Error> {
    let new_cards_create = sql::get_random_card_data(sql, amount).await?;

	//NOTE: maybe this could be smth for the future:
    // (highest-level)^3 * 0.5

    let mut rng = thread_rng();

    let mut cards_create_data = Vec::new();

    for card in new_cards_create.iter() {
        let quality: i32 = rng.gen_range(quality_range.clone());

        //TODO: improve the way to pick level (not algorythm but code)
        let mut level = 0;
        let level_random: i32 = rng.gen_range(0..=1000);
        if level_random <= 50 {
            level = 1;
            if level_random <= 5 {
                level = 2;
            }
        }

        let card_create_data = CardCreateData {
            card_id: card.card_id.clone(),
            frame_id: card.frame_id,
            level,
            quality
        };

        cards_create_data.push(card_create_data);
    }

    Ok(cards_create_data)
}
