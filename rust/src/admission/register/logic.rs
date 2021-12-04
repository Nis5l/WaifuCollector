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

    let password_hash = rjtry!(bcrypt_hash(&data.password));

    rjtry!(sql::register(&sql, &data.username, &password_hash, &data.email).await);

    //TODO: send mail
    
    return ApiResponseErr::api_err(Status::Ok, String::from("Register succeeded"))
}
