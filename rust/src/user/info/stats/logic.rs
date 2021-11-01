use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::{State, http::Status};

use crate::sql::Sql;
use crate::config::Config;
use crate::shared::friend;
use crate::shared::Id;
use super::sql;
use super::data::UserStatsResponse;

#[get("/user/<user_id>/stats")]
pub async fn user_stats_route(user_id: Id, sql: &State<Sql>, config: &State<Config>) -> ApiResponseErr<UserStatsResponse> {
    let friend_count = rjtry!(friend::sql::used_friend_slots(&sql, user_id).await);
    let card_count = rjtry!(sql::get_user_card_count(&sql, user_id).await);
    let max_card_count = rjtry!(sql::get_max_card_count(&sql).await);
    //let trades = rjtry!(sql::get_trades(&sql).await);

    //let trade_cooldown_count = config.max_trades - ;

    /* if stats.is_none() {
        return ApiResponseErr::api_err(Status::NotFound, String::from("User not found"));
    } */

    //TODO: come back to this when after longs have been replaced with DateTimes, start with /pack.
    ApiResponseErr::ok(Status::Ok, UserStatsResponse {
        max_friends: config.max_friends,
        friends: friend_count,

        max_cards: max_card_count,
        cards: card_count,

        max_trades: 0,
        trades: 0,
        
        achievements: Vec::new()
    })
}
