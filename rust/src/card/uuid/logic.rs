use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::State;
use rocket::http::Status;

use super::data::CardUuidResponse;
use crate::shared::card;
use crate::sql::Sql;
use crate::config::Config;
use crate::shared::Id;

#[get("/card/<card_unlocked_id>")]
pub async fn card_uuid_route(card_unlocked_id: Id, sql: &State<Sql>, config: &State<Config>) -> ApiResponseErr<CardUuidResponse> {
    let card_opt = rjtry!(card::sql::get_card(sql, card_unlocked_id, None, config).await);

    match card_opt {
        None => ApiResponseErr::api_err(Status::NotFound, format!("Unlocked card with id {} not found", card_unlocked_id)),
        Some(card) => ApiResponseErr::ok(Status::Ok, CardUuidResponse { card })
    }
}
