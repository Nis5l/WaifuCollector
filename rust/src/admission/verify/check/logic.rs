use rocketjson::{ApiResponseErr, rjtry, error::ApiErrorsCreate};
use rocket::State;
use rocket::http::Status;

use super::data::VerifiedResponse;
use super::sql;
use crate::sql::Sql;
use crate::crypto::JwtToken;
use crate::shared::user::data::UserVerified;

#[get("/verify/check")]
pub async fn verify_check_route(sql: &State<Sql>, token: JwtToken) -> ApiResponseErr<VerifiedResponse> {
    let user_id = token.id;

    let verify_db = rjtry!(sql::get_verify_data(sql, user_id).await);

    let verified = if let Ok(verified) = UserVerified::from_db(&verify_db.email, verify_db.verified) {
        verified
    } else {
        return ApiResponseErr::api_err(Status::InternalServerError, String::from("Internal Server Error"));
    };

    ApiResponseErr::ok(Status::Ok, VerifiedResponse {
        verified,
        email: verify_db.email
    })
}
