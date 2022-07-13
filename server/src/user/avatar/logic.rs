use std::path::Path;

use rocket::{fs::NamedFile, http::Status};

use super::data::AvatarResponse;

#[get("/user/<user_id>/avatar")]
pub async fn user_avatar(user_id: String) -> AvatarResponse {

    //TODO: Check if has set custom avatar

    let file = match NamedFile::open(Path::new("static/avatar/default.png")).await {
        Ok(file) => file,
        Err(_) => return AvatarResponse::api_err(Status::NotFound, String::from("Couldn't find avatar"))
    };

    AvatarResponse::ok(Status::Ok, file)
}