#[macro_use]
extern crate rocket;
#[macro_use]
extern crate diesel;

use rocket::fairing::AdHoc;

mod user;
mod sql;
mod config;

#[get("/")]
fn index() -> &'static str {
    "WaifuCollector API"
}

#[launch]
fn rocket() -> _ {
    rocket::custom(config::get_figment().expect("initializing config failed"))
        .mount("/", routes![index, user::register_user])
        .register("/", vec![rocketjson::error::get_catcher()])
        .attach(AdHoc::config::<config::Config>())
        .attach(sql::Sql::fairing())
}
