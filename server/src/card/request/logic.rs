use rocketjson::{ ApiResponseErr, rjtry, error::ApiErrorsCreate };
use rocket::http::Status;
use rocket::State;

use crate::shared::crypto::JwtToken;
use crate::config::Config;
use crate::sql::Sql;
use crate::shared::Id;
use crate::verify_user;
use super::data::{CardRequestResponse, CardRequestRequest};
use super::sql;

#[post("/card/request", data="<data>")]
pub async fn card_request_route(data: CardRequestRequest, token: JwtToken, config: &State<Config>, sql: &State<Sql>) -> ApiResponseErr<CardRequestResponse> {
    let user_id = &token.id;
    verify_user!(sql, user_id, true);

    if rjtry!(sql::card_exists(sql, &data.name, &data.card_type, &data.user_id).await) {
        return ApiResponseErr::api_err(Status::Conflict, String::from("Card already exists"))
    }

    let card_id = Id::new(config.id_length);
    rjtry!(sql::create_card_request(sql, &data.name, &data.card_type, user_id).await);

    ApiResponseErr::ok(Status::Ok, CardRequestResponse { id: card_id })
}
