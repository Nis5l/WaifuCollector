use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::{State, http::Status};

use crate::sql::Sql;
use crate::config::Config;
use super::sql;
use super::data::{UsersRequest, UsersResponse};

#[get("/users", data="<data>")]
pub async fn users_route(sql: &State<Sql>, data: UsersRequest, config: &State<Config> ) -> ApiResponseErr<Vec<UsersResponse>> {
    let users_tuple = rjtry!(sql::get_users(&sql, data.username.unwrap_or(String::from("")), config.users_page_amount).await);

    let users = users_tuple.into_iter().map(|t| UsersResponse { username: t.0, id: t.1 }).collect();

    ApiResponseErr::ok(Status::Ok, users)
}
