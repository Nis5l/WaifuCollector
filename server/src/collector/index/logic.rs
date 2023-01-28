use rocket::{State, http::Status};
use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};

use crate::sql::Sql;
use crate::config::Config;
use crate::shared::collector::Collector;

use super::sql;

#[get("/collector?<search>&<page>")]
pub async fn collector_index_route(sql: &State<Sql>, config: &State<Config>, search: Option<String>, page: Option<u32>) -> ApiResponseErr<Vec<Collector>> {
    let s = search.unwrap_or(String::from(""));
    println!("{}", &s);
    let collectors = rjtry!(sql::get_collectors(&sql, s, config.collectors_page_amount, config.collectors_page_amount * page.unwrap_or(0)).await);
    ApiResponseErr::ok(Status::Ok, collectors)
}
