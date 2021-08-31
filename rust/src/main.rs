/*
#[macro_use] extern crate rocket;

mod user;

#[get("/")]
fn index() -> &'static str {
    "WaifuCollector API"
}

#[launch]
fn rocket() -> _ {
    rocket::build()
        .mount("/", routes![index, user::register]).
        register("/", vec![rocketjson::error::get_bad_request_catcher()])
}
*/
 #[macro_use] extern crate rocket;

 #[derive(serde::Deserialize, validator::Validate, rocketjson::JsonBody)]
 pub struct RegisterRequest {
    #[validate(length(min = 1))]
    username: String 
 }

 #[derive(serde::Serialize)]
 pub struct RegisterResponse {
    message: String
 }

 #[post("/register", data="<data>")]
 pub fn register(data: RegisterRequest) -> rocketjson::ApiResponse<RegisterResponse> {
    rocketjson::ApiResponse::new(rocket::http::Status::Ok, RegisterResponse { message: format!("Welcome {}", data.username) })
 }

 #[launch]
 fn rocket() -> _ {
     rocket::build()
         .mount("/", routes![register]).
         register("/", vec![rocketjson::error::get_request_catcher()])
 }
