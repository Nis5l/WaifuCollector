use crate::sql::Sql;
use crate::config::Config;
use crate::crypto::{bcrypt_verify, jwt_sign_token};

use super::data::{LoginRequest, LoginResponse};
use super::sql;

use rocketjson::{ApiResponseErr, rjtry};
use rocket::http::Status;

#[post("/login", data="<data>")]
pub async fn login_user(data: LoginRequest, sql: Sql, config: &rocket::State<Config>) -> ApiResponseErr<LoginResponse> {
    //TODO: some sort of timeout
    let (user_id, username, password_hash)  = rjtry!(sql::get_user_password(&sql, data.username).await);

    let verified = bcrypt_verify(&data.password, &password_hash);

    if verified.is_err() {
        return ApiResponseErr::api_err(Status::InternalServerError, String::from("Internal server error"));
    }

    if !verified.unwrap() {
        return ApiResponseErr::api_err(Status::Unauthorized, String::from("Wrong password"));
    }

    let token = jwt_sign_token(&username, user_id, &config.jwt_secret);

    if token.is_err() {
        return ApiResponseErr::api_err(Status::InternalServerError, String::from("Internal server error"));
    }

    ApiResponseErr::ok(Status::Ok, LoginResponse::new(token.unwrap()))
}
