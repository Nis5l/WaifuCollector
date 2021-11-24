use crate::sql::Sql;
use crate::crypto::bcrypt_hash;

use crate::shared::user;
use super::data::{RegisterRequest, RegisterResponse};
use super::sql;

use rocket::http::Status;
use rocketjson::{rjtry, ApiResponseErr, error::ApiErrorsCreate};
use rocket::State;

#[post("/register", data="<data>")]
pub async fn register_route(data: RegisterRequest, sql: &State<Sql>) -> ApiResponseErr<RegisterResponse> {
    //TODO: some sort of timeout
    if rjtry!(user::sql::email_exists(&sql, &data.email).await) {
        return ApiResponseErr::ok(Status::Conflict, RegisterResponse::new(String::from("Mail already in use")));
    }

    if rjtry!(sql::user_exists(&sql, &data.username).await) {
        return ApiResponseErr::ok(Status::Conflict, RegisterResponse::new(String::from("User already exists")));
    }

    let id = if let Ok(hash) = bcrypt_hash(&data.password) {
        rjtry!(sql::register(&sql, &data.username, &hash, &data.email).await)
    } else {
        return ApiResponseErr::ok(
            Status::InternalServerError,
            RegisterResponse::new(String::from("Internal server error"))
        );
    };

    //TODO: send mail
    
    return ApiResponseErr::api_err(Status::Ok, String::from("Register succeeded"))
}
