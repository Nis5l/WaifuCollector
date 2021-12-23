use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::State;
use rocket::http::Status;
use chrono::Utc;

use crate::shared::Id;
use crate::sql::Sql;
use crate::crypto::JwtToken;
use crate::shared::{friend, user, notification};
use crate::verify_user;
use super::data::TradeSuggestionRemoveResponse;
use super::sql;

#[post("/trade/<user_friend_id>/suggestion/remove/<card_unlocked_id>")]
pub async fn trade_suggestion_remove_route(user_friend_id: Id, card_unlocked_id: Id, sql: &State<Sql>, token: JwtToken) -> ApiResponseErr<TradeSuggestionRemoveResponse> {
    let user_id = token.id;
    let username = token.username;

    verify_user!(sql, user_id);

    let user_friend_username = if let Some(username) = rjtry!(user::sql::username_from_user_id(sql, user_friend_id).await) {
        username
    } else {
        return ApiResponseErr::api_err(Status::NotFound, format!("User with id {} not found", user_friend_id));
    };

    if !rjtry!(friend::sql::user_has_friend(sql, user_id, user_friend_id).await) {
        return ApiResponseErr::api_err(Status::NotFound, format!("You are not friends with {}", user_friend_id));
    }

    if !rjtry!(sql::remove_suggestion(sql, user_id, user_friend_id, card_unlocked_id).await){
        return ApiResponseErr::api_err(Status::NotFound,
                                   format!("The card with the id {} is not in the trade with the user {}",
                                           card_unlocked_id, user_friend_username));
    }

    rjtry!(notification::sql::add_notification(sql, user_friend_id, &notification::data::NotificationCreateData {
        title: String::from("Card Suggestion Removed"),
        message: format!("{} removed a card suggestion, click to view!", username),
        url: format!("trade/{}", user_id),
        time: Utc::now()
    }).await);

    ApiResponseErr::ok(Status::Ok, TradeSuggestionRemoveResponse {
        message: format!("Removed suggestion with id {} from Trade with {}", card_unlocked_id, user_friend_username)
    })
}
