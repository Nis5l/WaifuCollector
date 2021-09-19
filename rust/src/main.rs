#[macro_use]
extern crate rocket;
#[macro_use]
extern crate diesel;

use rocket::fairing::AdHoc;

mod user;
mod sql;
mod config;
mod crypto;

//TODO:
// /card/give
// /:id/rank
// /log
// /notifications
// /login
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
// /friends
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
// /users
// /flex

#[get("/")]
fn index() -> &'static str {
    "WaifuCollector API"
}

#[launch]
fn rocket() -> _ {
    rocket::custom(config::get_figment().expect("initializing config failed"))
        .mount("/", routes![index, user::register_user, user::login_user])
        .register("/", vec![rocketjson::error::get_catcher()])
        .attach(AdHoc::config::<config::Config>())
        .attach(sql::Sql::fairing())
}
