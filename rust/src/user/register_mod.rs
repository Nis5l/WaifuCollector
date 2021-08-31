use validator::Validate;

#[derive(serde::Deserialize, validator::Validate, rocketjson::JsonBody)]
pub struct RegisterRequest {
    #[validate(length(min = 1))]
    username: String
}

#[derive(serde::Serialize)]
pub struct RegisterResponse {
    message: String
}

impl RegisterResponse {
    fn new(message: String) -> Self {
        Self {
            message
        }
    }
}

#[post("/register", data="<data>")]
pub fn register(data: RegisterRequest) -> rocketjson::ApiResponse<RegisterResponse> {
    rocketjson::ApiResponse::new(rocket::http::Status::Ok, RegisterResponse::new(format!("Welcome {}", data.username)))
}
