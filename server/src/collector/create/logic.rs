use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::State;
use rocket::http::Status;

use crate::sql::Sql;
use crate::config::Config;
use crate::shared::crypto::JwtToken;
use crate::shared::crypto::random_string::generate_random_string;
use super::data::{CollectorCreateRequest, CollectorCreateResponse};
use super::sql;

#[post("/collector/create", data="<data>")]
pub async fn create_collector_route(data: CollectorCreateRequest, token: JwtToken, sql: &State<Sql>, config: &State<Config>) -> ApiResponseErr<CollectorCreateResponse> {
    let user_id = token.id;
    let collector_name = data.name;

    if rjtry!(sql::collector_exists(&sql, &collector_name).await) {
        return ApiResponseErr::api_err(Status::Conflict, format!("Collector with the name {} alread exists", &collector_name));
    }

    let collector_id = generate_random_string(config.id_length);
    rjtry!(sql::create_collector(&sql, &collector_name, &collector_id, &user_id).await);

    ApiResponseErr::ok(Status::Ok, CollectorCreateResponse {
        id: collector_id
    })
}
