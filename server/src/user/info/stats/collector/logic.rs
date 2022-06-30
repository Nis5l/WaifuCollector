use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::{State, http::Status};

use crate::sql::Sql;
use crate::config::Config;
use crate::shared::{friend, user};
use crate::shared::Id;
use super::sql;
use super::data::UserStatsCollectorResponse;
use super::super::shared::sql::get_achievements;

#[get("/user/<user_id>/stats/<collector_id>")]
pub async fn user_stats_collector_route(user_id: Id, collector_id: Id, sql: &State<Sql>, config: &State<Config>) -> ApiResponseErr<UserStatsCollectorResponse> {
    if rjtry!(user::sql::username_from_user_id(sql, &user_id).await).is_none() {
        return ApiResponseErr::api_err(Status::NotFound, format!("No user with id {} not found", &user_id));
    }

    let friend_count = rjtry!(friend::sql::used_friend_slots(sql, &user_id).await);
    let card_count = rjtry!(sql::get_user_card_count(sql, &user_id, &collector_id).await);
    let max_card_count = rjtry!(sql::get_max_card_count(sql, &collector_id).await);
    let trades_cooldown_count = rjtry!(sql::get_trades_on_cooldown_count(sql, &user_id, &collector_id, config.trade_cooldown).await);
    let achievements = rjtry!(get_achievements(sql, &user_id, Some(&collector_id)).await);


    ApiResponseErr::ok(Status::Ok, UserStatsCollectorResponse {
        max_friends: config.max_friends,
        friends: friend_count,

        max_cards: max_card_count,
        cards: card_count,

        max_trades: config.max_trades,
        trades: trades_cooldown_count,

        achievements
    })
}
