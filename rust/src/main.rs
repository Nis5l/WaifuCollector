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
// ALTER TABLE user RENAME users;
// /notifications POST -> GET
// ALTER TABLE notification RENAME notifications;
// ALTER TABLE notifications CHANGE userID userId INTEGER;
//
// /register:
// mail -> email
//
// /friends POST -> GET -> /user/:id/friends
// userID -> userId
// ALTER TABLE friend RENAME friends;
// ALTER TABLE friends ADD COLUMN id INTEGER PRIMARY KEY AUTO_INCREMENT FIRST;
// ALTER TABLE friends CHANGE friend_status friendStatus SMALLINT;
// UPDATE friends SET friendStatus = 1 WHERE friendStatus = 2;
//
// /user/:id -> /user/:id/username
//
// /user/:id/stats
// badges -> achievements
// ALTER TABLE unlocked CHANGE userID userId INT;
// ALTER TABLE unlocked CHANGE cardID cardId INT;
// ALTER TABLE unlocked CHANGE frameID frameId INT;
//
// card:
// card -> cardInfo
// frame -> cardFrame
// type -> cardType
// effect -> cardEffect
//
// /pack -> /pack/open
//
// ALTER TABLE packtime CHANGE time lastOpened DATETIME;
// ALTER TABLE packtime CHANGE userID userId INT; //keeps primary on local but better check
// UPDATE packtime SET lastOpened = NULL WHERE lastOpened = "0000-00-00 00:00:00";
//
// POST /packtime -> GET /pack/time

//TODO port from server.js:
// /card/give
// /:id/rank
// /log
// /user/:id/stats
// smth dashboard
// /packTimeMax
// /pack
// /passchange
// GET /inventory
// /card/:uuid
// /upgrade
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
// /deleteNotification
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
    let config_figment = config::get_figment().expect("Initializing config failed");

    let config: config::Config = config_figment.extract().expect("Initializing config failed");

    let pool = MySqlPoolOptions::new()
        .max_connections(5)
        .connect(&config.db_connection)
        .await.expect("Creating DB pool failed");

    rocket::custom(config_figment)
        .mount("/", routes![
           index,

           user::register_route,
           user::login_route,
           user::notifications_route,
           user::users_route,
           user::info::user_username_route,
           user::info::user_friends_route,
           user::info::user_badges_route,
           user::info::user_stats_route,

           action::pack::pack_open_route,
           action::pack::pack_time_route
        ])
        .register("/", vec![rocketjson::error::get_catcher()])
        .attach(AdHoc::config::<config::Config>())
        .manage(sql::Sql(pool))
}
