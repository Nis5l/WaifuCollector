use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::State;
use chrono::{DateTime, Utc, Duration};
use rocket::http::Status;

use super::data::PackTimeResponse;
use super::super::shared;
use crate::crypto::JwtToken;
use crate::sql::Sql;
use crate::config::Config;

#[get("/pack/time")]
pub async fn pack_time_route(sql: &State<Sql>, token: JwtToken, config: &State<Config>) -> ApiResponseErr<PackTimeResponse> {
    let user_id = token.id;

    let last_opened = rjtry!(shared::sql::get_pack_time(sql, user_id).await);

    let pack_time = get_pack_time(last_opened, config.pack_cooldown);

    return ApiResponseErr::ok(Status::Ok, PackTimeResponse {
        pack_time: pack_time.to_string()
    })
}

pub fn get_pack_time(last_opened: Option<DateTime<Utc>>, pack_cooldown: u32) -> DateTime<Utc> {
    match last_opened {
        None => {
            return Utc::now();
        },
        Some(time) => {
            return time + Duration::seconds(pack_cooldown as i64);
        }
    }
}
