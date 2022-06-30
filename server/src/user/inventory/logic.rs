use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::http::Status;
use rocket::State;

use crate::shared::card::data::Card;
use crate::shared::Id;
use crate::sql::Sql;
use crate::config::Config;
use crate::shared::{user, card};
use super::data::InventoryRequest;
use super::sql;

#[post("/user/<user_id>/inventory/<collector_id>", data="<data>")]
pub async fn inventory_route(user_id: Id, collector_id: Id, mut data: InventoryRequest, sql: &State<Sql>, config: &State<Config>) -> ApiResponseErr<Vec<Card>> {
    if rjtry!(user::sql::username_from_user_id(sql, &user_id).await).is_none() {
        return ApiResponseErr::api_err(Status::NotFound, format!("User with id {} not found", user_id));
    }

    if let Some(friend) = data.friend {
        data.exclude_uuids.append(&mut sql::get_trade_uuids(sql, &user_id, &friend.friend_id, friend.exclude_suggestions).await.unwrap());
    }

    let cards = rjtry!(card::sql::get_inventory(sql, config, &card::data::InventoryOptions {
        card_id: data.card_id,
        collector_id,
        user_id,
        exclude_uuids: data.exclude_uuids,
        search: data.search,
        sort_type: data.sort_type,
        level: data.level,
        count: config.inventory_page_amount,
        offset: config.inventory_page_amount * data.page,
    }).await);

    ApiResponseErr::ok(Status::Ok, cards)
}
