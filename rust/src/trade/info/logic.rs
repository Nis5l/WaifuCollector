use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::http::Status;
use rocket::State;
use chrono::{Duration, DateTime, Utc};

use super::data::TradeResponse;
use super::sql;
use crate::sql::Sql;
use crate::config::Config;
use crate::shared::Id;
use crate::crypto::JwtToken;
use crate::shared::{user, friend, trade::data::TradeStatus};

#[get("/trade/<user_id_friend>")]
pub async fn trade_route(user_id_friend: Id, sql: &State<Sql>, config: &State<Config>, token: JwtToken) -> ApiResponseErr<TradeResponse> {
    let user_id = token.id;

    if !rjtry!(friend::sql::user_has_friend(sql, user_id, user_id_friend).await) {
        return ApiResponseErr::api_err(Status::NotFound, format!("No friend with id {} found", user_id_friend));
    }

    let friend_username = if let Some(username) = rjtry!(user::sql::username_from_user_id(sql, user_id_friend).await) {
        username
    } else {
        return ApiResponseErr::api_err(Status::NotFound, format!("User with id {} not found", user_id_friend));
    };

    let self_cards = rjtry!(sql::trade_cards(sql, user_id, user_id_friend, config).await);
    let friend_cards = rjtry!(sql::trade_cards(sql, user_id_friend, user_id, config).await);

    let self_card_suggestions = rjtry!(sql::trade_suggestions(sql, user_id, user_id_friend, config).await);
    let friend_card_suggestions = rjtry!(sql::trade_suggestions(sql, user_id_friend, user_id, config).await);

    let trade_db = rjtry!(sql::get_trade(sql, user_id, user_id_friend).await);

    let (self_status, friend_status) =
        if let (Some(self_status), Some(friend_status)) = (TradeStatus::from_int(trade_db.self_status), TradeStatus::from_int(trade_db.friend_status)) {
            (self_status, friend_status)
    } else {
        return ApiResponseErr::api_err(Status::InternalServerError, String::from("Internal Server Error"));
    };

    let trade_time = get_trade_time(trade_db.last_trade, config.trade_cooldown).await;

    ApiResponseErr::ok(Status::Ok, TradeResponse {
        self_cards,
        friend_cards,
        self_card_suggestions,
        friend_card_suggestions,
        friend_username,
        self_status,
        friend_status,
        trade_time,
        trade_card_limit: config.trade_card_limit
    })
}

async fn get_trade_time(trade_time: Option<DateTime<Utc>>, trade_cooldown: u32) -> DateTime<Utc> {
    match trade_time {
        None => {
            return Utc::now();
        },
        Some(time) => {
            return time + Duration::seconds(trade_cooldown as i64);
        }
    }
}
