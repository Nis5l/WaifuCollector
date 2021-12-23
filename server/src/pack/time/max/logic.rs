use rocketjson::ApiResponseErr;
use rocket::State;
use chrono::Duration;
use rocket::http::Status;

use super::data::PackTimeMaxResponse;
use crate::config::Config;

#[get("/pack/time/max")]
pub async fn pack_time_max_route(config: &State<Config>) -> ApiResponseErr<PackTimeMaxResponse> {
    let pack_time_max = config.pack_cooldown;

    let duration = Duration::seconds(pack_time_max as i64);

    return ApiResponseErr::ok(Status::Ok, PackTimeMaxResponse {
        pack_time_max: duration.to_string()
    })
}
