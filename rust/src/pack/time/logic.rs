use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::State;
use rocket::http::Status;

use super::data::PackTimeResponse;
use super::super::shared;
use crate::crypto::JwtToken;
use crate::sql::Sql;
use crate::config::Config;
use crate::shared::util;
use crate::verify_user;

#[get("/pack/time")]
pub async fn pack_time_route(sql: &State<Sql>, token: JwtToken, config: &State<Config>) -> ApiResponseErr<PackTimeResponse> {
    let user_id = token.id;

    verify_user!(sql, user_id);

    let last_opened = rjtry!(shared::sql::get_pack_time(sql, user_id).await);

    let pack_time = util::time_from_db(last_opened, config.pack_cooldown);

    return ApiResponseErr::ok(Status::Ok, PackTimeResponse {
        pack_time: pack_time.to_string()
    })
}
