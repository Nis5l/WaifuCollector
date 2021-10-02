#[macro_use]
extern crate rocket;

use rocket::fairing::AdHoc;

use sqlx::mysql::MySqlPoolOptions;

mod user;
mod sql;
mod config;
mod crypto;

//CANGES:
///notifications POST -> GET
///register:
///mail -> email
///
///friends:
///userID -> userId
///ALTER TABLE friend RENAME friends;
///ALTER TABLE friends ADD COLUMN id INTEGER PRIMARY KEY AUTO_INCREMENT FIRST;

//TODO port from server.js:
// /card/give
// /:id/rank
// /log
// /notifications
// /user/:id
// /user/:id/badges
// /user/:id/stats
// smth dashboard
// /packTime
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
               user::users_route
        ])
        .register("/", vec![rocketjson::error::get_catcher()])
        .attach(AdHoc::config::<config::Config>())
        .manage(sql::Sql(pool))
        //.attach(sql::Sql::fairing())
}
