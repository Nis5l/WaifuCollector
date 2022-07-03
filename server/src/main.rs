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

mod user;
mod sql;
mod config;
mod cors;
mod shared;
mod card;
mod notifications;
mod admission;
mod pack;
mod friend;
mod trade;
mod admin;

//DONE:
// user

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
           user::info::user_rank_route,
           user::info::stats::user_stats_global_route,
           user::info::stats::user_stats_collector_route,
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
}
