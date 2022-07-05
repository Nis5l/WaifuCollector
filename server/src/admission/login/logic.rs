use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::http::Status;
use rocket::State;

use crate::sql::Sql;
use crate::config::Config;
use crate::shared::crypto::{bcrypt_verify, jwt_sign_token};
use super::data::{LoginRequest, LoginResponse, LoginDb};
use super::sql;

#[post("/login", data="<data>")]
pub async fn login_route(data: LoginRequest, sql: &State<Sql>, config: &rocket::State<Config>) -> ApiResponseErr<LoginResponse> {
    //TODO: some sort of timeout

    let LoginDb { id: user_id, username, password: password_hash, role: role } = if let Some(login_db) = rjtry!(sql::get_user_password(&sql, data.username).await) {
        login_db
    } else {
        return ApiResponseErr::api_err(Status::Unauthorized, String::from("Wrong username or password"));
    };

    match bcrypt_verify(&data.password, &password_hash) {
        Err(_) => return ApiResponseErr::api_err(Status::InternalServerError, String::from("Internal server error")),
        Ok(false) => return ApiResponseErr::api_err(Status::Unauthorized, String::from("Wrong username or password")),
        Ok(_) => ()
    }

    match jwt_sign_token(&username, &user_id, &config.jwt_secret) {
        Ok(token) => ApiResponseErr::ok(Status::Ok, LoginResponse { token, user_id, username, role }),
        Err(_) => ApiResponseErr::api_err(Status::InternalServerError, String::from("Internal server error"))
    }
}
