use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::http::Status;
use rocket::State;

use super::data::TradeCardRemoveResponse;
use super::sql;
use crate::shared::Id;
use crate::shared::{user, card, friend, trade};
use crate::sql::Sql;
use crate::crypto::JwtToken;

#[post("/trade/<user_friend_id>/remove/<card_unlocked_id>")]
pub async fn trade_card_remove_route(user_friend_id: Id, card_unlocked_id: Id, sql: &State<Sql>, token: JwtToken) -> ApiResponseErr<TradeCardRemoveResponse> {
    let user_id = token.id;

    let user_friend_username = if let Some(username) = rjtry!(user::sql::username_from_user_id(sql, user_friend_id).await) {
        username
    } else {
        return ApiResponseErr::api_err(Status::NotFound, format!("No user with id {} found", user_friend_id));
    };

    if !rjtry!(friend::sql::user_has_friend(sql, user_id, user_friend_id).await) {
        return ApiResponseErr::api_err(Status::NotFound, format!("No friend with id {} found", user_friend_id));
    }

    if !rjtry!(card::sql::user_owns_card(sql, user_id, card_unlocked_id).await) {
        return ApiResponseErr::api_err(Status::NotFound, format!("The card with the id {} does not exist or is not owned by you", card_unlocked_id));
    }

    if !rjtry!(sql::delete_trade_card(sql, user_id, user_friend_id, card_unlocked_id).await) {
        return ApiResponseErr::api_err(Status::NotFound,
                                   format!("The card with the id {} is not in the trade with the user {}",
                                           card_unlocked_id, user_friend_username));
    }

    rjtry!(trade::sql::set_trade_status(sql, user_id, user_friend_id, trade::data::TradeStatus::UnConfirmed).await);

    ApiResponseErr::ok(Status::Ok, TradeCardRemoveResponse {
        message: format!("Removed card with id {} from Trade with {}", card_unlocked_id, user_friend_username)
    })
}
