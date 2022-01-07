use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::http::Status;
use rocket::State; use chrono::Utc;

use super::data::TradeCardAddResponse;
use super::sql;
use crate::crypto::JwtToken;
use crate::sql::Sql;
use crate::config::Config;
use crate::shared::{friend, card, trade, notification, user};
use crate::shared::Id;
use crate::verify_user;

#[post("/trade/<user_friend_id>/card/add/<card_unlocked_id>")]
pub async fn trade_card_add_route(card_unlocked_id: Id, user_friend_id: Id, sql: &State<Sql>, config: &State<Config>, token: JwtToken) -> ApiResponseErr<TradeCardAddResponse> {
    let user_id = token.id;
    let username = token.username;

    verify_user!(sql, user_id);

    //NOTE: this is not necessary since the friend check should be sufficient.
    //I do like the username instead of the Id in the error message
    let user_friend_username = if let Some(username) = rjtry!(user::sql::username_from_user_id(sql, user_friend_id).await) {
        username
    } else {
        return ApiResponseErr::api_err(Status::NotFound, format!("User with id {} not found", user_friend_id));
    };

    if !rjtry!(friend::sql::user_has_friend(sql, user_id, user_friend_id).await) {
        return ApiResponseErr::api_err(Status::NotFound, format!("You are not a friend with {}", user_friend_username));
    }

    if !rjtry!(card::sql::user_owns_card(sql, user_id, card_unlocked_id).await) {
        return ApiResponseErr::api_err(Status::NotFound, format!("The card with the id {} does not exist or is not owned by you", card_unlocked_id));
    }

    if rjtry!(sql::trade_card_count(sql, user_id, user_friend_id).await) >= config.trade_card_limit as i64 {
        return ApiResponseErr::api_err(Status::Conflict, format!("Max card limit of {} for trade reached", config.trade_card_limit));
    }

    if rjtry!(trade::sql::card_in_trade(sql, card_unlocked_id).await) {
        return ApiResponseErr::api_err(Status::Conflict, format!("Card with id {} is already in a trade", card_unlocked_id));
    }

    rjtry!(trade::sql::trade_add_card(sql, user_id, user_friend_id, card_unlocked_id).await);

    rjtry!(sql::remove_suggestions(sql, card_unlocked_id).await);

    rjtry!(trade::sql::create_trade(sql, user_id, user_friend_id).await);

    rjtry!(trade::sql::set_trade_status(sql, user_id, user_friend_id, trade::data::TradeStatus::UnConfirmed, trade::data::TradeStatus::UnConfirmed).await);

    if rjtry!(trade::sql::suggestion_in_trade(sql, user_id, user_friend_id, card_unlocked_id).await) {
        rjtry!(notification::sql::add_notification(sql, user_friend_id, &notification::data::NotificationCreateData {
            title: String::from("Card Suggestion Accepted"),
            message: format!("{} accepted a card suggestion you made, click to view!", username),
            url: format!("trade/{}", user_id),
            time: Utc::now()
        }).await);
    } else {
        rjtry!(notification::sql::add_notification(sql, user_friend_id, &notification::data::NotificationCreateData {
            title: String::from("Card Added To Trade"),
            message: format!("{} added a new card to the trade, click to view!", username),
            url: format!("trade/{}", user_id),
            time: Utc::now()
        }).await);
    }

    ApiResponseErr::ok(Status::Ok, TradeCardAddResponse {
        message: format!("Successfully added card {} to the trade", card_unlocked_id)
    })
}
