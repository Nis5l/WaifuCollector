use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::http::Status;
use rocket::State;

use crate::shared::crypto::{JwtToken, random_string::generate_random_string};
use crate::sql::Sql;
use crate::shared::{user, card};
use crate::config::Config;
use super::data::{GiveCardRequest, GiveCardResponse};

#[post("/admin/give/card", data="<data>")]
pub async fn give_card_route(data: GiveCardRequest, sql: &State<Sql>, config: &State<Config>, token: JwtToken) -> ApiResponseErr<GiveCardResponse> {
    let user_id = token.id;

    if !matches!(rjtry!(user::sql::get_user_rank(sql, &user_id).await), Ok(user::data::UserRanking::Admin)) {
        return ApiResponseErr::api_err(Status::Forbidden, String::from("You need to be admin to view this"))
    }

    let card_unlocked_id = generate_random_string(config.id_length);

    rjtry!(card::sql::add_card(sql, &data.user_id, &card_unlocked_id, &card::data::CardCreateData {
        card_id: data.card_id,
        frame_id: data.frame_id,
        quality: data.quality,
        level: data.level
    }).await);

    ApiResponseErr::ok(Status::Ok, GiveCardResponse {
        uuid: card_unlocked_id
    })
}
