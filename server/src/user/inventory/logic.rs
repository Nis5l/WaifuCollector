use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::http::Status;
use rocket::State;

use crate::shared::card::data::UnlockedCard;
use crate::shared::Id;
use crate::sql::Sql;
use crate::config::Config;
use crate::shared::card;
use crate::{verify_user, verify_collector};
use super::data::InventoryRequest;
use super::sql;

#[post("/user/<user_id>/<collector_id>/inventory", data="<data>")]
pub async fn inventory_route(user_id: Id, collector_id: Id, mut data: InventoryRequest, sql: &State<Sql>, config: &State<Config>) -> ApiResponseErr<Vec<UnlockedCard>> {
    verify_user!(sql, &user_id, false);
    verify_collector!(sql, &collector_id);

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
