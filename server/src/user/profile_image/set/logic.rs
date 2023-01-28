use rocketjson::{ApiResponseErr, error::ApiErrorsCreate};
use rocket::http::Status;
use rocket::State;
use rocket::form::Form;
use std::fs;
use std::path::Path;

use crate::sql::Sql;
use crate::config::Config;
use crate::shared::crypto::JwtToken;
use crate::verify_user;
use super::data::{ProfileImageSetResponse, ProfileImageSetRequest};
use crate::scripts::resize_profile_image;

#[put("/user/profile-image", data="<data>")]
pub async fn profile_image_set_route(mut data: Form<ProfileImageSetRequest<'_>>, sql: &State<Sql>, config: &State<Config>, token: JwtToken) -> ApiResponseErr<ProfileImageSetResponse> {
    let user_id = token.id;
    verify_user!(sql, &user_id, true);

    let path = Path::new(&config.user_fs_base).join(user_id.to_string());
    if let Err(_) = fs::create_dir_all(&path) {
         return ApiResponseErr::api_err(Status::InternalServerError, String::from("fs error"))
    }

    if let Err(_) = data.file.copy_to(path.join("profile-image")).await {
         return ApiResponseErr::api_err(Status::InternalServerError, String::from("error saving file"))
    }

    resize_profile_image(path.join("profile-image"));

    ApiResponseErr::ok(Status::Ok, ProfileImageSetResponse {
        message: String::from("profile image set")
    })
}
