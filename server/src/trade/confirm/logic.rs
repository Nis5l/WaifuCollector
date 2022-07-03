use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::http::Status;
use rocket::State;
use chrono::Utc;

use super::data::TradeConfirmReponse;
use super::sql;
use crate::shared::Id; use crate::shared::{friend, trade, notification};
use crate::shared::crypto::{JwtToken, random_string::generate_random_string};
use crate::sql::Sql;
use crate::config::Config;
use crate::{verify_user, verify_collector};

#[post("/trade/<user_friend_id>/<collector_id>/confirm")]
pub async fn trade_confirm_route(user_friend_id: Id, collector_id: Id, sql: &State<Sql>, config: &State<Config>, token: JwtToken) -> ApiResponseErr<TradeConfirmReponse> {
    let user_id = token.id;

    verify_user!(sql, &user_id, true);
    //NOTE: could be removed if not for the username
    let user_friend_username = verify_user!(sql, &user_friend_id, false);
    verify_collector!(sql, &collector_id);

    if !rjtry!(friend::sql::user_has_friend(sql, &user_id, &user_friend_id).await) {
        return ApiResponseErr::api_err(Status::NotFound, format!("You are not friends with {}", user_friend_username));
    }

    let trade_id = rjtry!(trade::sql::create_trade(sql, &generate_random_string(config.id_length), &user_id, &user_friend_id, &collector_id).await);

    let trade_db = rjtry!(trade::sql::get_trade(sql, &user_id, &trade_id).await);

    let friend_status = if let Ok(friend_status) = trade::data::TradeStatus::from_int(trade_db.friend_status) {
            friend_status
    } else {
        return ApiResponseErr::api_err(Status::InternalServerError, String::from("Internal Server Error"));
    };

    if let trade::data::TradeStatus::Confirmed = friend_status {
        rjtry!(notification::sql::add_notification(sql, &user_friend_id, Some(&collector_id), &notification::data::NotificationCreateData {
            title: String::from("Trade Completed"),
            message: format!("Completed trade with {}", user_friend_username),
            time: Utc::now(),
            url: format!("trade/{}", &user_id)
        }).await);

        rjtry!(sql::complete_trade(sql, &trade_id).await);
        rjtry!(trade::sql::set_trade_status(sql, &trade_id, trade::data::TradeStatus::UnConfirmed).await);

        return ApiResponseErr::ok(Status::Ok, TradeConfirmReponse {
            message: format!("Trade with user {} completed", user_friend_username)
        })
    }

    rjtry!(trade::sql::set_trade_status_one(sql, &user_id, &user_friend_id, trade::data::TradeStatus::Confirmed).await);

    rjtry!(notification::sql::add_notification(sql, &user_friend_id, Some(&collector_id), &notification::data::NotificationCreateData {
        title: String::from("Trade Confirmed"),
        message: format!("{} confirmed the trade", &user_friend_username),
        time: Utc::now(),
        url: format!("trade/{}", &user_id)
    }).await);

    ApiResponseErr::ok(Status::Ok, TradeConfirmReponse {
        message: format!("Confirmed trade with user {}", &user_friend_username)
    })
}
