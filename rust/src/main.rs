#[macro_use]
extern crate rocket;

use rocket::fairing::AdHoc;

use sqlx::mysql::MySqlPoolOptions;

mod user;
mod sql;
mod config;
mod crypto;
mod shared;
mod action;
mod card;

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
// /upgrade
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

//TODO port from server.js:
// /user/:id/stats
//
// /card/give
// /log
// smth dashboard
// /passchange
// GET /inventory /trade
// /addtrade
// /suggesttrade
// /removetrade
// /removesuggestion
// /acceptsuggestion
// /okTrade
// /tradeTime
// /packData
// /verified
// /setmail
// /deleteMail
// /verify
// /mail
// /verify/resend
// /flex

#[get("/")]
fn index() -> &'static str {
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

    println!("Setting up database...");
    for file in config.db_init_files.iter() {
        println!("-{}", file);
        sql::setup_db(&sql, file).await.expect("Failed setting up database");
    }

    rocket::custom(config_figment)
        .mount("/", routes![
           index,

           user::register_route,
           user::login_route,
           user::users_route,
           user::notifications_route,
           user::notifications::notifications_delete_route,
           user::notifications::notifications_delete_all_route,
           user::info::user_username_route,
           user::info::user_friends_route,
           user::info::user_badges_route,
           user::info::user_stats_route,
           user::info::user_rank_route,

           action::pack::open::pack_open_route,
           action::pack::time::pack_time_route,
           action::pack::time::max::pack_time_max_route,
           action::upgrade::upgrade_route,
           action::friend::add::friend_add_route,
           action::friend::accept::friend_accept_route,
           action::friend::remove::friend_remove_route,

           card::uuid::card_uuid_route
        ])
        .register("/", vec![rocketjson::error::get_catcher()])
        .attach(AdHoc::config::<config::Config>())
        .manage(sql)
}
