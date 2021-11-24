use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::http::Status;
use rocket::State;
use chrono::Utc;

use super::data::TradeSuggestionAddResponse;
use super::sql;
use crate::sql::Sql;
use crate::shared::Id;
use crate::shared::{user, friend, card, trade, notification};
use crate::crypto::JwtToken;
use crate::verify_user;

#[post("/trade/<user_friend_id>/suggestion/add/<card_unlocked_id>")]
pub async fn trade_suggestion_add_route(user_friend_id: Id, card_unlocked_id: Id, sql: &State<Sql>, token: JwtToken) -> ApiResponseErr<TradeSuggestionAddResponse> {
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
        return ApiResponseErr::api_err(Status::NotFound, format!("You are not friends with {}", user_friend_id));
    }

    if !rjtry!(card::sql::user_owns_card(sql, user_friend_id, card_unlocked_id).await) {
        return ApiResponseErr::api_err(Status::NotFound, format!("The card with the id {} does not exist or is not owned by {}", card_unlocked_id, user_friend_username));
    }

    if rjtry!(trade::sql::card_in_trade(sql, card_unlocked_id).await) {
        return ApiResponseErr::api_err(Status::Conflict, format!("Card with id {} is already in a trade", card_unlocked_id));
    }

    if rjtry!(trade::sql::suggestion_in_trade(sql, user_id, user_friend_id, card_unlocked_id).await) {
        return ApiResponseErr::api_err(Status::Conflict, format!("Card with id {} is already suggested in the trade with {}", card_unlocked_id, user_friend_username));
    }

    rjtry!(sql::trade_suggestion_add(sql, user_id, user_friend_id, card_unlocked_id).await);

    rjtry!(notification::sql::add_notification(sql, user_friend_id, &notification::data::NotificationCreateData {
        title: String::from("Suggestion Added To Trade"),
        message: format!("{} added a new suggestion to the trade, click to view!", username),
        url: format!("trade/{}", user_id),
        time: Utc::now()
    }).await);

    ApiResponseErr::ok(Status::Ok, TradeSuggestionAddResponse {
        message: format!("Successfully added suggestion {} to the trade", card_unlocked_id)
    })
}
