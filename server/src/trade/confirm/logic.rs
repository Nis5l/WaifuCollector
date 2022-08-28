use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::http::Status;
use rocket::State;
use chrono::Utc;

use super::data::TradeConfirmReponse;
use super::sql;
use crate::shared::Id; use crate::shared::{user, friend, trade, notification};
use crate::crypto::JwtToken;
use crate::sql::Sql;
use crate::verify_user;

#[post("/trade/<user_friend_id>/confirm")]
pub async fn trade_confirm_route(user_friend_id: Id, sql: &State<Sql>, token: JwtToken) -> ApiResponseErr<TradeConfirmReponse> {
    let user_id = token.id;
    
    verify_user!(sql, user_id);

    let user_friend_username = if let Some(username) = rjtry!(user::sql::username_from_user_id(sql, user_friend_id).await) {
        username
    } else {
        return ApiResponseErr::api_err(Status::NotFound, format!("No user with id {} found", user_friend_id));
    };

    if !rjtry!(friend::sql::user_has_friend(sql, user_id, user_friend_id).await) {
        return ApiResponseErr::api_err(Status::NotFound, format!("You are not friends with {}", user_friend_username));
    }

    rjtry!(trade::sql::create_trade(sql, user_id, user_friend_id).await);

    let trade_db = rjtry!(trade::sql::get_trade(sql, user_id, user_friend_id).await);

    let friend_status =
        if let Ok(friend_status) = trade::data::TradeStatus::from_int(trade_db.friend_status) {
            friend_status
    } else {
        return ApiResponseErr::api_err(Status::InternalServerError, String::from("Internal Server Error"));
    };

    println!("{:?}", friend_status);

    if let trade::data::TradeStatus::Confirmed = friend_status {
        rjtry!(notification::sql::add_notification(sql, user_friend_id, &notification::data::NotificationCreateData {
            title: String::from("Trade Completed"),
            message: format!("Completed trade with {}", user_friend_username),
            time: Utc::now(),
            url: format!("trade/{}", user_id)
        }).await);

        rjtry!(sql::complete_trade(sql, user_id, user_friend_id).await);
        rjtry!(trade::sql::set_trade_status(sql, user_id, user_friend_id, trade::data::TradeStatus::UnConfirmed, trade::data::TradeStatus::UnConfirmed).await);

        return ApiResponseErr::ok(Status::Ok, TradeConfirmReponse {
            message: format!("Trade with user {} completed", user_friend_username)
        })
    }

    rjtry!(trade::sql::set_trade_status_one(sql, user_id, user_friend_id, trade::data::TradeStatus::Confirmed).await);

    rjtry!(notification::sql::add_notification(sql, user_friend_id, &notification::data::NotificationCreateData {
        title: String::from("Trade Confirmed"),
        message: format!("{} confirmed the trade", user_friend_username),
        time: Utc::now(),
        url: format!("trade/{}", user_id)
    }).await);

    ApiResponseErr::ok(Status::Ok, TradeConfirmReponse {
        message: format!("Confirmed trade with user {}", user_friend_username)
    })
}
