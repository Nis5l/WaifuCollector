#[macro_use] extern crate rocket;

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
    rocket::custom(config::get_figment())
        .mount("/", routes![index, user::register_user])
        .register("/", vec![rocketjson::error::get_catcher()])
        .attach(AdHoc::config::<config::Config>())
}
