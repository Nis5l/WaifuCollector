use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::State;
use rocket::http::Status;
use std::fs;
use std::io;

use super::data::AdminLogResponse;
use crate::sql::Sql;
use crate::config::Config;
use crate::shared::crypto::JwtToken;
use crate::shared::user;

#[get("/admin/log")]
pub async fn admin_log_route(sql: &State<Sql>, config: &State<Config>, token: JwtToken) -> ApiResponseErr<AdminLogResponse> {
    let user_id = token.id;

    if !matches!(rjtry!(user::sql::get_user_rank(sql, &user_id).await), Ok(user::data::UserRanking::Admin)) {
        return ApiResponseErr::api_err(Status::Forbidden, String::from("You need to be admin to view this"))
    }

    let log = rjtry!(read_logfile(&config.log_file));

    ApiResponseErr::ok(Status::Ok, AdminLogResponse {
        log
    })
}

fn read_logfile(path: &str) -> io::Result<String> {
    fs::read_to_string(path)
}
