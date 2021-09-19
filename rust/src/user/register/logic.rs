use crate::sql::Sql;
use crate::crypto::bcrypt_hash;

use super::data::{RegisterRequest, RegisterResponse};
use super::sql;

use rocket::http::Status;
use rocketjson::{rjtry, ApiResponseErr};

#[post("/register", data="<data>")]
pub async fn register_user(data: RegisterRequest, db: Sql) -> ApiResponseErr<RegisterResponse> {
    let email_exists = rjtry!(sql::email_exists(&db, data.mail.clone()).await);

    if email_exists {
        return ApiResponseErr::ok(Status::Conflict, RegisterResponse::new(String::from("Mail already in use")));
    }

    let user_exists = rjtry!(sql::user_exists(&db, data.username.clone()).await);

    if user_exists {
        return ApiResponseErr::ok(Status::Conflict, RegisterResponse::new(String::from("User already exists")));
    }

    let hash = bcrypt_hash(&data.password);

    if hash.is_err() {
        return ApiResponseErr::ok(
            Status::InternalServerError,
            RegisterResponse::new(String::from("Internal server error")
        ));
    }

    let id = rjtry!(sql::register(&db, data.username, hash.unwrap(), data.mail).await);

    //TODO: send mail
    return ApiResponseErr::api_err(Status::Ok, String::from("Register succeeded"))
}