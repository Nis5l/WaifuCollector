use rocket::http::Status;
use rocket::State;
use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};

use crate::sql::Sql;
use crate::shared::Id;
use crate::config::Config;
use crate::shared::card;

#[get("/user/<user_id>/flex")]
pub async fn flex_route(user_id: Id, sql: &State<Sql>, config: &State<Config>) -> ApiResponseErr<Vec<card::data::Card>> {
    let cards = rjtry!(card::sql::get_inventory(sql, config, &card::data::InventoryOptions {
        user_id,
        count: config.flex_cards_amount,
        exclude_uuids: Vec::new(),
        offset: 0,
        search: String::from(""),
        sort_type: card::data::SortType::Level,
        level: None,
        card_id: None
    }).await);

    ApiResponseErr::ok(Status::Ok, cards)
}
