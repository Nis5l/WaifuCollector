use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::State;
use rocket::http::Status;

use super::data::CardUuidResponse;
use crate::shared::card;
use crate::sql::Sql;
use crate::config::Config;

#[get("/card/<card_uuid>")]
pub async fn card_uuid_route(card_uuid: i32, sql: &State<Sql>, config: &State<Config>) -> ApiResponseErr<CardUuidResponse> {
    let card_opt = rjtry!(card::sql::get_card(sql, card_uuid, None, config).await);

    match card_opt {
        None => ApiResponseErr::api_err(Status::NotFound, format!("Card with uuid {} not found", card_uuid)),
        Some(card) => ApiResponseErr::ok(Status::Ok, CardUuidResponse { card })
    }
}
