use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::http::Status;
use rocket::State;

use crate::shared::crypto::{JwtToken, random_string::generate_random_string};
use crate::sql::Sql;
use crate::shared::{Id, user, card};
use crate::config::Config;
use crate::{verify_collector, verify_user};

use super::data::{GiveCardRequest, GiveCardResponse};

#[post("/<collector_id>/admin/give/card", data="<data>")]
pub async fn give_card_route(collector_id: Id, data: GiveCardRequest, sql: &State<Sql>, config: &State<Config>, token: JwtToken) -> ApiResponseErr<GiveCardResponse> {
    let user_id = token.id;

    verify_user!(sql, &data.user_id, false);
    verify_collector!(sql, &collector_id);

    if !matches!(rjtry!(user::sql::get_user_rank(sql, &user_id).await), Ok(user::data::UserRanking::Admin)) {
        return ApiResponseErr::api_err(Status::Forbidden, String::from("You need to be admin to view this"))
    }

    let card_unlocked_id = generate_random_string(config.id_length);

    rjtry!(card::sql::add_card(sql, &data.user_id, &card_unlocked_id, &collector_id, &card::data::CardCreateData {
        card_id: data.card_id,
        frame_id: data.frame_id,
        quality: data.quality,
        level: data.level
    }).await);

    ApiResponseErr::ok(Status::Ok, GiveCardResponse {
        uuid: card_unlocked_id
    })
}
