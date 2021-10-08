use super::data::{UserBadgesResponse, Badge};

use rocketjson::ApiResponseErr;
use rocket::http::Status;

//TODO: this is obv. a placeholder and should be stored in the database!
//8,3: Nissl and SmallCode
const DEVS: [i32; 2] = [8, 3];

#[get("/user/<id>/badges")]
pub async fn user_badges_route(id: i32) -> ApiResponseErr<UserBadgesResponse> {
    let mut badges = Vec::new();

    if DEVS.contains(&id) {
        badges.push(Badge {
			name: "Developer",
			asset: "/badges/dev.jpg"
        });
    }

    ApiResponseErr::ok(Status::Ok, UserBadgesResponse { badges })
}
