#[macro_use]
extern crate rocket;

//TODO: there are some dattimes as string in ret

use rocket::fairing::AdHoc;

use sqlx::mysql::MySqlPoolOptions;

mod user;
mod sql;
mod config;
mod crypto;
mod shared;
mod card;
mod notifications;
mod admission;
mod pack;
mod friend;
mod trade;

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
// /removed /acceptsuggestion, the notification is sent nonetheless
//
// /verified -> /verify/check
// mail -> email
//
// /verify -> /verify/confirm/<key>

//TODO port from server.js:
// /user/:id/stats
//
// /card/give
// /log
// smth dashboard
// /passchange
// GET /inventory
// /acceptsuggestion
// /okTrade
// /tradeTime
// /packData
// /setmail
// /deleteMail
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

    //TODO: paths not relative to start path
    println!("Setting up database...");
    for file in config.db_init_files.iter() {
        println!("-{}", file);
        sql::setup_db(&sql, file).await.expect("Failed setting up database");
    }

    rocket::custom(config_figment)
        .mount("/", routes![
           index,

           admission::register::register_route,
           admission::login::login_route,
           admission::verify::check::verify_check_route,
           admission::verify::confirm::verify_confirm_route,

           user::users_route,
           user::info::user_username_route,
           user::info::user_friends_route,
           user::info::user_badges_route,
           user::info::user_stats_route,
           user::info::user_rank_route,

           notifications::notifications_route,
           notifications::notifications_delete_route,
           notifications::notifications_delete_all_route,

           pack::open::pack_open_route,
           pack::time::pack_time_route,
           pack::time::max::pack_time_max_route,

           friend::add::friend_add_route,
           friend::accept::friend_accept_route,
           friend::remove::friend_remove_route,

           card::uuid::card_uuid_route,
           card::upgrade::upgrade_route,

           trade::info::trade_route,
           trade::card::add::trade_card_add_route,
           trade::card::remove::trade_card_remove_route,
           trade::suggestion::add::trade_suggestion_add_route,
           trade::suggestion::remove::trade_suggestion_remove_route
        ])
        .register("/", vec![rocketjson::error::get_catcher()])
        .attach(AdHoc::config::<config::Config>())
        .manage(sql)
}
