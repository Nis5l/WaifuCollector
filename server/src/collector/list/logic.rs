use rocket::{State, http::Status};
use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};

use crate::{sql::Sql, shared::collector::Collector};

use super::sql;

#[get("/collector/list")]
pub async fn get_all_collectors(sql: &State<Sql>) -> ApiResponseErr<Vec<Collector>> {
    let collectors = rjtry!(sql::get_all_collectors(&sql).await);
    ApiResponseErr::ok(Status::Ok, collectors)
}