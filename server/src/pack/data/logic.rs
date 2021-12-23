use rocketjson::ApiResponseErr;
use rocket::http::Status;

#[get("/pack/data")]
pub async fn pack_data_route() -> ApiResponseErr<Vec<i32>> {
    ApiResponseErr::ok(Status::Ok, Vec::new())
}
