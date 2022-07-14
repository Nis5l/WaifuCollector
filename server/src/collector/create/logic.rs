use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::State;
use rocket::http::Status;

use crate::sql::Sql;
use crate::config::Config;
use crate::shared::{crypto::JwtToken, Id};
use crate::verify_user;
use super::data::{CollectorCreateRequest, CollectorCreateResponse};
use super::sql;

#[post("/collector/create", data="<data>")]
pub async fn create_collector_route(data: CollectorCreateRequest, token: JwtToken, sql: &State<Sql>, config: &State<Config>) -> ApiResponseErr<CollectorCreateResponse> {
    let user_id = token.id;
    verify_user!(&sql, &user_id, true);

    let collector_name = data.name;

    if rjtry!(sql::collector_exists(&sql, &collector_name).await) {
        return ApiResponseErr::api_err(Status::Conflict, format!("Collector with the name {} alread exists", &collector_name));
    }

    let collector_id = Id::new(config.id_length);
    rjtry!(sql::create_collector(&sql, &collector_name, &collector_id, &user_id).await);

    ApiResponseErr::ok(Status::Ok, CollectorCreateResponse {
        id: collector_id
    })
}
