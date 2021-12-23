use rocketjson::ApiResponseErr;
use rocket::http::Status;

use super::data::UserBadgesResponse;
use crate::shared::Id;
use crate::shared::user;

#[get("/user/<user_id>/badges")]
pub async fn user_badges_route(user_id: Id) -> ApiResponseErr<UserBadgesResponse> {
    let badges = user::data::get_badges(user_id);

    ApiResponseErr::ok(Status::Ok, UserBadgesResponse { badges })
}
