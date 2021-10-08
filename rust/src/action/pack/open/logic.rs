use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::http::Status;
use rocket::State;

use super::data::PackOpenResponse;
use super::sql;
use crate::crypto::JwtToken;
use crate::sql::Sql;

#[post("/pack/open")]
pub async fn pack_open_route(sql: &State<Sql>, token: JwtToken) -> ApiResponseErr<PackOpenResponse> {
    let time_opt = rjtry!(sql::get_pack_time(sql, token.id).await);

    match time_opt {
        None => {

        }

        Some(time) => {

        }
    }
    //println!("time: {:?}", time);

    ApiResponseErr::api_err(Status::InternalServerError, String::from("Not implemented"))
}
