use super::data;
use rocket::http::Status;

#[post("/register", data="<data>")]
pub fn register_user(data: data::RegisterRequest) -> rocketjson::ApiResponseErr<data::RegisterResponse> {
    if data.username == "admin" && data.password == "admin" {
        return rocketjson::ApiResponseErr::ok(Status::Ok, data::RegisterResponse::new(format!("Welcome {}", data.username)));
    }

    return rocketjson::ApiResponseErr::err(Status::InternalServerError, String::from("login failed"))
}
