use std::path::Path;
use rocket::State;
use rocket::{fs::NamedFile, http::Status};

use crate::config::Config;
use crate::sql::Sql;
use crate::shared::Id;
use crate::shared::user;
use super::data::ProfileImageGetResponse;

#[get("/user/<user_id>/profile-image")]
pub async fn profile_image_get_route(user_id: Id, sql: &State<Sql>, config: &State<Config>) -> ProfileImageGetResponse {
    //NOTE: check user_id to avoid path traversal attacks or similar
    match user::sql::username_from_user_id(sql, &user_id).await {
        Ok(Some(_)) => (),
        Ok(None) => return ProfileImageGetResponse::api_err(Status::NotFound, format!("User with id {} not found", user_id)),
        Err(_) => return ProfileImageGetResponse::api_err(Status::InternalServerError, String::from("database error"))
    }

    let path = Path::new(&config.user_fs_base);

    let file = match NamedFile::open(path.join(user_id.to_string()).join("profile-image")).await {
        Ok(file) => file,
        Err(_) => match NamedFile::open(path.join("profile-image-default")).await {
            Ok(file) => file,
            Err(_) => return ProfileImageGetResponse::api_err(Status::InternalServerError, String::from("default image not found"))
        }
    };

    ProfileImageGetResponse::ok(Status::Ok, file)
}
