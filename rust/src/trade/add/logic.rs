use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::http::Status;
use rocket::State;
use chrono::Utc;

use super::data::TradeAddResponse;
use super::sql;
use crate::crypto::JwtToken;
use crate::sql::Sql;
use crate::config::Config;
use crate::shared::{friend, card, trade, notification};
use crate::shared::Id;

#[post("/trade/<user_friend_id>/add/<card_unlocked_id>")]
pub async fn trade_add_route(card_unlocked_id: Id, user_friend_id: Id, sql: &State<Sql>, config: &State<Config>, token: JwtToken) -> ApiResponseErr<TradeAddResponse> {
    let user_id = token.id;
    let username = token.username;

    if !rjtry!(friend::sql::user_has_friend(sql, user_id, user_friend_id).await) {
        return ApiResponseErr::api_err(Status::NotFound, format!("No friend with id {} found", user_friend_id));
    }

    if !rjtry!(card::sql::user_owns_card(sql, user_id, card_unlocked_id).await) {
        return ApiResponseErr::api_err(Status::NotFound, format!("The card with the id {} does not exist or is not owned by you", card_unlocked_id));
    }

    if rjtry!(sql::trade_card_count(sql, user_id, user_friend_id).await) >= config.trade_card_limit as i64 {
        return ApiResponseErr::api_err(Status::Conflict, format!("Max card limit of {} for trade reached", config.trade_card_limit));
    }

    if rjtry!(sql::card_in_trade(sql, card_unlocked_id).await) {
        return ApiResponseErr::api_err(Status::Conflict, format!("Card with id {} is already in a trade", card_unlocked_id));
    }

    rjtry!(sql::trade_add_card(sql, user_id, user_friend_id, card_unlocked_id).await);

    rjtry!(sql::remove_suggestions(sql, card_unlocked_id).await);

    rjtry!(trade::sql::set_trade_status(sql, user_id, user_friend_id, trade::data::TradeStatus::UnConfirmed).await);

    rjtry!(notification::sql::add_notification(sql, user_friend_id, &notification::data::NotificationCreateData {
        title: String::from("Card Added To Trade"),
        message: format!("{} added a new card to the trade, click to view!", username),
        url: format!("trade/{}", user_id),
        time: Utc::now()
    }).await);

    ApiResponseErr::ok(Status::Ok, TradeAddResponse {
        message: format!("Successfully added card {} to the trade", card_unlocked_id)
    })
}
