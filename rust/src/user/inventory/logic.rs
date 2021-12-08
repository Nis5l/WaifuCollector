use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::http::Status;
use rocket::State;

use crate::shared::card::data::Card;
use crate::shared::Id;
use crate::sql::Sql;
use crate::config::Config;
use crate::shared::user;
use super::data::{InventoryRequest, InventoryOptions};
use super::sql;

#[post("/user/<user_id>/inventory", data="<data>")]
pub async fn inventory_route(user_id: Id, mut data: InventoryRequest, sql: &State<Sql>, config: &State<Config>) -> ApiResponseErr<Vec<Card>> {
    if rjtry!(user::sql::username_from_user_id(sql, user_id).await).is_none() {
        return ApiResponseErr::api_err(Status::NotFound, format!("User with id {} not found", user_id));
    }

    if let Some(friend) = data.friend {
        data.exclude_uuids.append(&mut rjtry!(sql::get_trade_uuids(sql, user_id, friend.friend_id, friend.exclude_suggestions).await));
    }

    let cards = sql::get_inventory(sql, config, &InventoryOptions {
        card_id: data.card_id,
        user_id,
        exclude_uuids: data.exclude_uuids,
        search: data.search,
        sort_type: data.sort_type,
        level: data.level,
        count: config.inventory_page_amount,
        offset: config.inventory_page_amount * data.page,
    }).await.unwrap();

    ApiResponseErr::ok(Status::Ok, cards)
}
