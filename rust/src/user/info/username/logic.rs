use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::{State, http::Status};

use crate::sql::Sql;
use super::sql;
use super::data::UserUsernameResponse;

#[get("/user/<id>/username")]
pub async fn user_username_route(id: u32, sql: &State<Sql>) -> ApiResponseErr<UserUsernameResponse> {
    let username = rjtry!(sql::get_user_username(&sql, id).await);

    if username.is_none() {
        return ApiResponseErr::api_err(Status::NotFound, String::from("User not found"));
    }

    ApiResponseErr::ok(Status::Ok, UserUsernameResponse { username: username.unwrap() })
}
