use rocketjson::{rjtry, error::ApiErrorsCreate, ApiResponseErr};
use rocket::http::Status;
use rocket::State;

use super::data::VerifyConfirmResponse;
use super::sql;
use crate::shared::crypto::JwtToken;
use crate::sql::Sql;
use crate::shared::user;

#[post("/verify/confirm/<key>")]
pub async fn verify_confirm_route(key: String, sql: &State<Sql>, token: JwtToken) -> ApiResponseErr<VerifyConfirmResponse> {
    let JwtToken { id: user_id, username } = token;

    if let user::data::UserVerifiedDb::Yes = rjtry!(user::data::UserVerifiedDb::from_db(rjtry!(sql::user_verified(sql, &user_id).await))) {
            return ApiResponseErr::api_err(Status::Conflict, String::from("You are already verified"));
    };

    let verified_key = if let Some(verified_key) = rjtry!(sql::get_verification_key(sql, &user_id).await) {
        verified_key
    } else {
        return ApiResponseErr::api_err(Status::NotFound, format!("No verification key for user {} found", username))
    };

    if verified_key != key {
        return ApiResponseErr::api_err(Status::Unauthorized, String::from("Verification key invalid"))
    }

    rjtry!(sql::verify_user(sql, &user_id).await);
    rjtry!(sql::delete_verification_key(sql, &user_id).await);

    ApiResponseErr::ok(Status::Ok, VerifyConfirmResponse {
        message: format!("Successfully verified user {}", username)
    })
}
