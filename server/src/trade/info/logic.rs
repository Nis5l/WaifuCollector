use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::http::Status;
use rocket::State;

use super::data::TradeResponse;
use super::sql;
use crate::sql::Sql;
use crate::config::Config;
use crate::shared::Id;
use crate::shared::crypto::{JwtToken, random_string::generate_random_string};
use crate::shared::{user, util, friend, trade};
use crate::verify_user;

#[get("/trade/<user_id_friend>")]
pub async fn trade_route(user_id_friend: Id, sql: &State<Sql>, config: &State<Config>, token: JwtToken) -> ApiResponseErr<TradeResponse> {
    let user_id = token.id;

    verify_user!(sql, &user_id);

    if user_id == user_id_friend {
        return ApiResponseErr::api_err(Status::BadRequest, String::from("Can not trade with yourself"));
    }

    let friend_username = if let Some(username) = rjtry!(user::sql::username_from_user_id(sql, &user_id_friend).await) {
        username
    } else {
        return ApiResponseErr::api_err(Status::NotFound, format!("User with id {} not found", user_id_friend));
    };

    if !rjtry!(friend::sql::user_has_friend(sql, &user_id, &user_id_friend).await) {
        return ApiResponseErr::api_err(Status::NotFound, format!("You are not friends with {}", friend_username));
    }

    let self_cards = rjtry!(sql::trade_cards(sql, &user_id, &user_id_friend, config).await);
    let friend_cards = rjtry!(sql::trade_cards(sql, &user_id_friend, &user_id, config).await);

    let self_card_suggestions = rjtry!(sql::trade_suggestions(sql, &user_id, &user_id_friend, config).await);
    let friend_card_suggestions = rjtry!(sql::trade_suggestions(sql, &user_id_friend, &user_id, config).await);

    rjtry!(trade::sql::create_trade(sql, &generate_random_string(config.id_length), &user_id, &user_id_friend).await);

    let trade_db = rjtry!(trade::sql::get_trade(sql, &user_id, &user_id_friend).await);

    let (self_status, friend_status) =
        if let (Ok(self_status), Ok(friend_status)) = (trade::data::TradeStatus::from_int(trade_db.self_status), trade::data::TradeStatus::from_int(trade_db.friend_status)) {
            (self_status, friend_status)
    } else {
        return ApiResponseErr::api_err(Status::InternalServerError, String::from("Internal Server Error"));
    };

    let trade_time = util::time_from_db(trade_db.last_trade, config.trade_cooldown);

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
