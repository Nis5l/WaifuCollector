use rocket::time::{OffsetDateTime, Duration};
use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::http::{Status, Cookie, CookieJar, SameSite};
use rocket::State;

use crate::sql::Sql;
use crate::config::Config;
use crate::shared::crypto::{bcrypt_verify, jwt_sign_token};
use super::data::{LoginRequest, LoginResponse, LoginDb};
use super::sql;

#[post("/login", data="<data>")]
pub async fn login_route(cookies: &CookieJar<'_>, data: LoginRequest, sql: &State<Sql>, config: &rocket::State<Config>) -> ApiResponseErr<LoginResponse> {

    let LoginDb { id: user_id, username, password: password_hash, role } = if let Some(login_db) = rjtry!(sql::get_user_password(&sql, data.username).await) {
        login_db
    } else {
        return ApiResponseErr::api_err(Status::Unauthorized, String::from("Wrong username or password"));
    };

    match bcrypt_verify(&data.password, &password_hash) {
        Err(_) => return ApiResponseErr::api_err(Status::InternalServerError, String::from("Internal server error")),
        Ok(false) => return ApiResponseErr::api_err(Status::Unauthorized, String::from("Wrong username or password")),
        Ok(_) => ()
    }

    let access_token: String = match jwt_sign_token(&username, &user_id, &config.jwt_secret) {
        Ok(token) => token,
        Err(_) => return ApiResponseErr::api_err(Status::InternalServerError, String::from("Internal server error"))
    };

    let refresh_token: String = match jwt_sign_token(&username, &user_id, &config.refresh_token_secret) {
        Ok(token) => token,
        Err(_) => return ApiResponseErr::api_err(Status::InternalServerError, String::from("Internal server error"))
    };

    let expires = OffsetDateTime::now_utc() + Duration::seconds(config.refresh_token_duration.into());

    let refresh_token_cookie: Cookie = Cookie::build("refresh_token", refresh_token.clone())
        .path("/")
        .same_site(SameSite::None)
        .secure(true)
        .http_only(true)
        .expires(expires)
        .finish();

    rjtry!(sql::insert_refresh_token(&sql, &user_id, &refresh_token).await);

    cookies.add(refresh_token_cookie);

    ApiResponseErr::ok(Status::Ok, LoginResponse { access_token, user_id, username, role })
}
