use crate::sql::Sql;
use crate::config::Config;
use crate::crypto::{bcrypt_verify, jwt_sign_token};

use super::data::{LoginRequest, LoginResponse};
use super::sql;

use rocketjson::{ApiResponseErr, error::{ApiErrors, ApiErrorsCreate}};
use rocket::http::Status;

#[post("/login", data="<data>")]
pub async fn login_user(data: LoginRequest, sql: Sql, config: &rocket::State<Config>) -> ApiResponseErr<LoginResponse> {
    //TODO: some sort of timeout
    let db_result = sql::get_user_password(&sql, data.username).await;

    if db_result.is_err() {
        let db_err = db_result.unwrap_err();
        if diesel::result::Error::NotFound == db_err {
            return ApiResponseErr::api_err(Status::Unauthorized, String::from("Wrong username or password"));
        }

        return ApiResponseErr::err(ApiErrors::to_rocketjson_error(db_err));
    }

    let (user_id, username, password_hash) = db_result.unwrap();

    let verified = bcrypt_verify(&data.password, &password_hash);

    if verified.is_err() {
        return ApiResponseErr::api_err(Status::InternalServerError, String::from("Internal server error"));
    }

    if !verified.unwrap() {
        return ApiResponseErr::api_err(Status::Unauthorized, String::from("Wrong username or password"));
    }

    let token = jwt_sign_token(&username, user_id, &config.jwt_secret);

    if token.is_err() {
        return ApiResponseErr::api_err(Status::InternalServerError, String::from("Internal server error"));
    }

    ApiResponseErr::ok(Status::Ok, LoginResponse::new(token.unwrap()))
}
