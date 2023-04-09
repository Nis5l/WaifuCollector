use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::{State, http::Status};

use crate::sql::Sql;
use crate::config::Config;
use crate::shared::Id;
use crate::shared::card::data::{ CardType, CardState };
use super::sql;

#[get("/<collector_id>/card-type?<name>&<page>&<state>")]
pub async fn card_type_index_route(collector_id: Id, sql: &State<Sql>, name: Option<String>, page: Option<u32>, state: Option<CardState>, config: &State<Config>) -> ApiResponseErr<Vec<CardType>> {
    let card_types = rjtry!(sql::get_card_types(&sql, &collector_id, name.unwrap_or(String::from("")), config.card_type_page_amount, page.unwrap_or(0) * config.card_type_page_amount, state).await);

    ApiResponseErr::ok(Status::Ok, card_types)
}
