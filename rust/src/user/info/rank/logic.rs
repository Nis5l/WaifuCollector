use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::http::Status;
use rocket::State;

use super::data::UserRankResponse;
use super::sql;
use crate::sql::Sql;
use crate::shared::Id;

#[get("/user/<user_id>/rank")]
pub async fn user_rank_route(user_id: Id, sql: &State<Sql>) -> ApiResponseErr<super::data::UserRankResponse> {
    let rank = rjtry!(sql::get_user_ranking(sql, user_id).await);

    ApiResponseErr::ok(Status::Ok, UserRankResponse { rank })
}
