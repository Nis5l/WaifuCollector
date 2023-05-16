use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::State;
use rocket::http::Status;

use super::sql;
use super::data::CardTypeRequestDeclineResponse;
use crate::shared::Id;
use crate::shared::card;
use crate::sql::Sql;
use crate::{verify_collector_admin, verify_user};
use crate::shared::crypto::JwtToken;

#[post("/card-type/request/<card_type_id>/decline")]
pub async fn card_type_request_decline_route(card_type_id: Id, sql: &State<Sql>, token: JwtToken) -> ApiResponseErr<CardTypeRequestDeclineResponse> {
    let user_id = &token.id;

    verify_user!(sql, user_id, true);
    let collector_id = rjtry!(card::sql::get_card_type_collector_id(sql, &card_type_id).await);
    verify_collector_admin!(sql, &collector_id, user_id);

    rjtry!(sql::card_type_request_decline(sql, &card_type_id).await);

    ApiResponseErr::ok(Status::Ok, CardTypeRequestDeclineResponse { message: String::from("Card-Type request declined") })
}
