use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::State;
use rocket::http::Status;

use super::data::TradeTimeResponse;
use super::sql;
use crate::sql::Sql;
use crate::config::Config;
use crate::shared::Id;
use crate::crypto::JwtToken;
use crate::shared::{trade, util};

#[get("/trade/<user_friend_id>/time")]
pub async fn trade_time_route(user_friend_id: Id, token: JwtToken, sql: &State<Sql>, config: &State<Config>) -> ApiResponseErr<TradeTimeResponse> {
    let user_id = token.id;

    if user_id == user_friend_id {
        return ApiResponseErr::api_err(Status::BadRequest, String::from("Can not trade with yourself"));
    }

    rjtry!(trade::sql::create_trade(sql, user_id, user_friend_id).await);

    let last_trade_time = rjtry!(sql::last_trade_time(sql, user_id, user_friend_id).await);

    let trade_time = util::time_from_db(last_trade_time, config.trade_cooldown);

    ApiResponseErr::ok(Status::Ok, TradeTimeResponse {
        trade_time
    })
}
