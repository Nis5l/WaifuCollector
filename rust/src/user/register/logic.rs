use super::data;
use super::sql;
use crate::sql::Sql;
use rocket::http::Status;
use rocketjson::rjtry;

#[post("/register", data="<data>")]
pub async fn register_user(data: data::RegisterRequest, db: Sql) -> rocketjson::ApiResponseErr<data::RegisterResponse> {
    let mail_exists = rjtry!(sql::email_exists(&db, data.mail).await);

    if mail_exists {
        return rocketjson::ApiResponseErr::ok(Status::Conflict, data::RegisterResponse::new(String::from("Mail already in use")));
    }

    if data.username == "admin" && data.password == "admin" {
        return rocketjson::ApiResponseErr::ok(Status::Ok, data::RegisterResponse::new(format!("Welcome {}", data.username)));
    }

    return rocketjson::ApiResponseErr::api_err(Status::InternalServerError, String::from("login failed"))
}
