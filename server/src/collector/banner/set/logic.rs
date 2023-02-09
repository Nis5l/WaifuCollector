use rocketjson::{ApiResponseErr, error::ApiErrorsCreate};
use rocket::http::Status;
use rocket::State;
use rocket::form::Form;
use std::fs;
use std::path::Path;

use crate::sql::Sql;
use crate::config::Config;
use crate::shared::Id;
use crate::shared::crypto::JwtToken;
use crate::shared::collector;
use crate::{verify_user, verify_collector};
use super::data::{CollectorBannerSetRequest, CollectorBannerSetResponse};
use crate::scripts::resize_image_banner;

#[put("/collector/<collector_id>/banner", data="<data>")]
pub async fn collector_banner_set_route(collector_id: Id,
                                       mut data: Form<CollectorBannerSetRequest<'_>>,
                                       sql: &State<Sql>,
                                       config: &State<Config>,
                                       token: JwtToken) -> ApiResponseErr<CollectorBannerSetResponse> {
    let user_id = token.id;
    verify_user!(sql, &user_id, true);
    verify_collector!(sql, &collector_id);

    match collector::sql::collecor_is_admin(sql, &collector_id, &user_id).await {
        Ok(true) => (),
        Ok(false) => return ApiResponseErr::api_err(Status::Unauthorized, format!("user with id {} is not admin of collector with id {}", user_id, collector_id)),
        Err(_) => return ApiResponseErr::api_err(Status::InternalServerError, String::from("database error"))

    }

    let path = Path::new(&config.collector_fs_base).join(collector_id.to_string());
    if let Err(_) = fs::create_dir_all(&path) {
         return ApiResponseErr::api_err(Status::InternalServerError, String::from("fs error"))
    }

    if let Err(_) = data.file.copy_to(path.join("collector-banner")).await {
         return ApiResponseErr::api_err(Status::InternalServerError, String::from("error saving file"))
    }

    resize_image_banner(path.join("collector-banner"));

    ApiResponseErr::ok(Status::Ok, CollectorBannerSetResponse {
        message: String::from("collector banner set")
    })
}
