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
// data -> notifications
//
// /upgrade
//    mainuuid -> cardOne
//    carduuid -> cardTwo

//TODO port from server.js:
// /card/give
// /:id/rank
// /log
// /user/:id/stats
// smth dashboard
// /passchange
// GET /inventory
// /card/:uuid
// /addfriend
// /managefriend
// /trade
// /addtrade
// /suggesttrade
// /removetrade
// /removesuggestion
// /acceptsuggestion
// /okTrade
// /tradeTime
// /deleteAllNotifications
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
    println!("- Setting up tables...");
    sql::setup_db(&sql, "./sqlfiles/tables.sql").await.expect("Failed setting up database");

    //TODO: all of this is pretty stupid the database shouldnt be repopulated on each run.
    println!("- Setting up cardtypes...");
    sql::setup_db(&sql, "./sqlfiles/cardtypes.sql").await.expect("Failed setting up database");
    println!("- Setting up cards...");
    sql::setup_db(&sql, "./sqlfiles/cards.sql").await.expect("Failed setting up database");
    println!("- Setting up cardframes...");
    sql::setup_db(&sql, "./sqlfiles/cardframes.sql").await.expect("Failed setting up database");
    println!("- Setting up cardeffects...");
    sql::setup_db(&sql, "./sqlfiles/cardeffects.sql").await.expect("Failed setting up database");
    println!("- Setting up badges...");
    sql::setup_db(&sql, "./sqlfiles/badges.sql").await.expect("Failed setting up database");

    rocket::custom(config_figment)
        .mount("/", routes![
           index,

           user::register_route,
           user::login_route,
           user::users_route,
           user::notifications_route,
           user::notifications::notifications_delete_route,
           user::info::user_username_route,
           user::info::user_friends_route,
           user::info::user_badges_route,
           user::info::user_stats_route,

           action::pack::open::pack_open_route,
           action::pack::time::pack_time_route,
           action::pack::time::max::pack_time_max_route,
           action::upgrade::upgrade_route,
        ])
        .register("/", vec![rocketjson::error::get_catcher()])
        .attach(AdHoc::config::<config::Config>())
        .manage(sql)
}
