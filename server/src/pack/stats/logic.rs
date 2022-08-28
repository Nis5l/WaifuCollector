use rocketjson::ApiResponseErr;
use rocket::http::Status;
use rocket::State;
use std::sync::Arc;
use tokio::sync::Mutex;

use crate::shared::card::packstats::data::{PackStats, PackStatsPair};

#[get("/pack/stats")]
pub async fn pack_stats_route(pack_stats: &State<Arc<Mutex<PackStats>>>) -> ApiResponseErr<Vec<PackStatsPair>> {
    println!("pack_stats_route prelock");
    let pack_stats = pack_stats.lock().await;
    println!("pack_stats_route postlock");
    ApiResponseErr::ok(Status::Ok, pack_stats.data.clone())
}
