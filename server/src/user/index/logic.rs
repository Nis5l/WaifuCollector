use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::{State, http::Status};

use crate::sql::Sql;
use crate::config::Config;
use crate::shared::user;
use super::sql;
use super::data::UsersResponse;

#[get("/user?<username>&<page>")]
pub async fn user_index_route(sql: &State<Sql>, username: Option<String>, page: Option<u32>, config: &State<Config> ) -> ApiResponseErr<Vec<UsersResponse>> {
    let users_tuple = rjtry!(sql::get_users(&sql, username.unwrap_or(String::from("")), config.users_page_amount, page.unwrap_or(0) * config.users_page_amount).await);

    let users = users_tuple.into_iter().map(|t| {
        let badges = user::data::get_badges(&t.1);
        UsersResponse { username: t.0, id: t.1, badges }
    }).collect();

    ApiResponseErr::ok(Status::Ok, users)
}
