use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::State;
use rocket::http::Status;

use super::data::{EmailChangeResponse, EmailChangeRequest};
use crate::sql::Sql;
use crate::config::Config;
use crate::crypto::{JwtToken, verification_key};
use crate::shared::user;

#[post("/email/change", data="<data>")]
pub async fn email_change_route(sql: &State<Sql>, config: &State<Config>, data: EmailChangeRequest, token: JwtToken) -> ApiResponseErr<EmailChangeResponse> {
    let user_id = token.id;

    match rjtry!(user::sql::user_verified(sql, user_id).await) {
        Ok(user::data::UserVerifiedDb::Yes) => return ApiResponseErr::api_err(Status::Conflict, String::from("Already verified")),
        Err(_) => return ApiResponseErr::api_err(Status::InternalServerError, String::from("Internal server error")),
        Ok(user::data::UserVerifiedDb::No) => ()
    }

    if rjtry!(user::sql::email_exists(sql, &data.email).await) {
        return ApiResponseErr::api_err(Status::Conflict, format!("Email {} already exists", &data.email))
    }

    rjtry!(user::sql::set_email(sql, user_id, Some(&data.email)).await);

    rjtry!(user::sql::set_verification_key(sql, user_id, &verification_key::generate_verification_key(config.verification_key_length)).await);

    //TODO: send mail

    ApiResponseErr::ok(Status::Ok, EmailChangeResponse {
        message: format!("Changed email to {}", data.email)
    })
}
