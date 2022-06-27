#[macro_use]
extern crate rocket;

use rocket::fairing::AdHoc;
//use rocket_cors::{AllowedHeaders, AllowedOrigins};
//use rocket::http::Method;
use sqlx::mysql::MySqlPoolOptions;
use rocket::{get, routes};
use rocket::fs::{FileServer, relative};
use std::sync::Arc;
use tokio::sync::Mutex;
use shared::card::packstats::data::PackStats;

mod user;
mod sql;
mod config;
mod cors;
mod crypto;
mod shared;
mod card;
mod notifications;
mod admission;
mod pack;
mod friend;
mod trade;
mod admin;

// CANGES:
// /notifications POST -> GET
//
// /register:
// mail -> email
//
// /friends POST -> GET -> /user/:id/friends
// userID -> userId
//
// /user/:id -> /user/:id/username
//
// /user/:id/stats
// badges -> achievements
//
// card data:
// card -> cardInfo
// frame -> cardFrame
// type -> cardType
// effect -> cardEffect
//
// /pack -> /pack/open
//
// POST /packtime -> GET /pack/time
// ISO String
//
// /packTimeMax -> /pack/time/max
// ISO String
//
// /deleteNotification -> notifications/delete/:id
// /deleteAllNotifications -> notifications/delete/all
// data -> notifications
//
// notification:
// time: int -> ISO
//
// /upgrade -> /card/upgrade
//    mainuuid -> cardOne
//    carduuid -> cardTwo
//
//    uuid -> card
//
// /:id/rank -> /user/:id/rank
// rankID -> rank
//
// /addfriend -> /friend/add
// userID -> userId
//
// /managefriend command: 0 -> /friend/accept
// /managefriend command: 1 -> /friend/remove
//
// /trade -> GET /trade/:user_id
// response:
//     cards -> selfCards
//     cardsfriend -> friendCards
//     cardsuggestions -> selfCardSuggestions
//     cardsuggestionsfriend -> friendCardSuggestions
//     username -> friendUsername
//     statusone -> selfStatus
//     statustwo -> friendStatus
//     tradeCount1 removed (count of the cards)
//     tradeCount2 removed (count of the cards)
//     tradeTime ISO Date NO DURATION
//     tradeLimit -> tradeCardLimit
//     tradeLimitReached removed (couldnt find it beeing used)
//
// /addtrade -> /trade/<user_friend_id>/card/add/<card_unlocked_id>
//
// /removetrade -> /trade/<user_friend_id>/card/remove/<card_unlocked_id>
// /suggesttrade -> /trade/<user_friend_id>/suggestion/add/<card_unlocked_id>
//
// /removesuggestion -> /trade/<user_friend_id>/suggestion/remove/<card_unlocked_id>
//
// removed /acceptsuggestion, the notification is sent nonetheless, user trade/card/add
//
// /verified -> /verify/check
// mail -> email
//
// /verify -> /verify/confirm/<key>
//
// /okTrade -> /trade/<user_friend_id>/confirm
//
// /tradeTime -> /trade/<user_friend_id>/time
//
// /mail -> GET /email
// response:
//   mail -> email
//   "" -> null
//
// /setmail -> /email/change
// request
//  mail -> email
//
// /deleteMail -> /email/delete
//
// /log -> GET /admin/log
//
// /passchange
// request
//  newpassword -> newPassword
//
// /verify/resend
//
// GET -> POST /user/:id/inventory
// request query -> body
//   userID remvoed
//   excludeUUID -> exludeUuids
//   friendID -> friend->friendId
//   excludeSuggestions -> friend->excludeSuggestions (bool)
// response
//   { card: [] } -> []
//
// /flex -> /user/:id/flex
//
// /card/give -> /admin/give/card
// request:
//      userID -> userId
//      cardID -> cardId
//      frame -> frameId
//
// /packdata -> /pack/data

//TODO port from server.js:
// /user/:id/stats
//
// /packData -> /pack/data
//
// TODO: packData process

#[get("/")]
fn index() -> &'static str {
    println!("index");
    "WaifuCollector API"
}

#[launch]
async fn rocket() -> _ {
    println!("Initializing config...");
    let config_figment = config::get_figment().expect("Initializing config failed");

    let config: config::Config = config_figment.extract().expect("Initializing config failed");

    println!("Connecting to database...");
    let sql = sql::Sql(MySqlPoolOptions::new()
        .max_connections(5)
        .connect(&config.db_connection)
        .await.expect("Creating DB pool failed"));

    //TODO: paths not relative to start path
    println!("Setting up database...");
    for file in config.db_init_files.iter() {
        println!("-{}", file);
        sql::setup_db(&sql, file).await.expect("Failed setting up database");
    }

    /*
    let allowed_origins = AllowedOrigins::all();

    let cors = rocket_cors::CorsOptions {
        allowed_origins,
        allowed_methods: vec![
		Method::Get,
		Method::Post,
		Method::Patch,
		Method::Put,
		Method::Delete,
		Method::Head,
		Method::Options].into_iter().map(From::from).collect(),
        allowed_headers: AllowedHeaders::all(),
        allow_credentials: true,
        ..Default::default()
    }
    .to_cors().expect("Error initializing CORS");
    */


    println!("Initializing PackStats...");
    //cloning should be fine because it is implemented as Arc
    let mut pack_stats = PackStats::new(sql.clone(), &config).await.unwrap();
    pack_stats.init().await.expect("Error initializing PackStats");
    let pack_stats = Arc::new(Mutex::new(pack_stats));

    println!("Starting PackStats Thread...");
    {
        let pack_stats = pack_stats.clone();

        tokio::spawn(async {
            PackStats::start_thread(pack_stats).await
        });
    }

    rocket::custom(config_figment)
        .mount("/", routes![
           index,

           admission::register::register_route,
           admission::login::login_route,
           admission::verify::check::verify_check_route,
           admission::verify::confirm::verify_confirm_route,
           admission::verify::resend::verify_resend_route,
           admission::email::get::email_get_route,
           admission::email::change::email_change_route,
           admission::email::delete::email_delete_route,
           admission::passchange::passchange_route,

           user::users_route,
           user::info::user_username_route,
           user::info::user_friends_route,
           user::info::user_badges_route,
           user::info::user_stats_route,
           user::info::user_rank_route,
           user::inventory::inventory_route,
           user::flex::flex_route,

           notifications::notifications_route,
           notifications::notifications_delete_route,
           notifications::notifications_delete_all_route,

           pack::open::pack_open_route,
           pack::time::pack_time_route,
           pack::time::max::pack_time_max_route,
           pack::stats::pack_stats_route,

           friend::add::friend_add_route,
           friend::accept::friend_accept_route,
           friend::remove::friend_remove_route,

           card::uuid::card_uuid_route,
           card::upgrade::upgrade_route,

           trade::info::trade_route,
           trade::confirm::trade_confirm_route,
           trade::card::add::trade_card_add_route,
           trade::card::remove::trade_card_remove_route,
           trade::suggestion::add::trade_suggestion_add_route,
           trade::suggestion::remove::trade_suggestion_remove_route,
           trade::time::trade_time_route,

           admin::log::admin_log_route,
           admin::give::card::give_card_route
        ])
        .mount(format!("/{}", &config.card_image_base), FileServer::from(relative!("static/card")))
        .mount(format!("/{}", &config.frame_image_base), FileServer::from(relative!("static/frame")))
        .mount(format!("/{}", &config.effect_image_base), FileServer::from(relative!("static/effect")))
        .mount(format!("/{}", &config.achievements_image_base), FileServer::from(relative!("static/achievements")))
        .mount(format!("/{}", &config.badges_image_base), FileServer::from(relative!("static/badges")))
        .register("/", vec![rocketjson::error::get_catcher()])
        .attach(AdHoc::config::<config::Config>())
        .attach(cors::CORS)
        .manage(sql)
        .manage(pack_stats)
}
