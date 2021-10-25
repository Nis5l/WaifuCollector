use figment::{Figment, providers::{Format, Json, Serialized}};

#[derive(Debug, serde::Deserialize, serde::Serialize)]
pub struct Config {
    pub jwt_secret: String,

    pub username_len_min: u32,
    pub username_len_max: u32,

    pub password_len_min: u32,
    pub password_len_max: u32,

    pub users_page_amount: u32,

    pub max_friends: u32,
    pub max_trades: u32,

    //seconds
    pub pack_cooldown: u32,
    pub pack_amount: u32,
    pub pack_quality_min: i32,
    pub pack_quality_max: i32,

    pub db_connection: String,

    pub card_image_base: String,
    pub frame_image_base: String,
    pub effect_image_base: String,

    pub db_init_files: Vec<String>
}

impl Default for Config {
    fn default() -> Self {
        Self {
            //NOTE: important to change
            jwt_secret: String::from("CHANGE_THE_SECRET"),

            username_len_min: 4,
            username_len_max: 20,

            password_len_min: 8,
            password_len_max: 30,

            users_page_amount: 5,

            max_friends: 50,
            max_trades: 5,

            pack_cooldown: 30,
            pack_amount: 1,
            pack_quality_min: 1,
            pack_quality_max: 5,

            db_connection: String::from("mysql://root@localhost/waifucollector"),

            card_image_base: String::from("Card/"),
            frame_image_base: String::from("Frame/"),
            effect_image_base: String::from("Effect/"),

            db_init_files: vec![
                String::from("./sqlfiles/tables.sql"),
                String::from("./sqlfiles/cardtypes.sql"),
                String::from("./sqlfiles/cards.sql"),
                String::from("./sqlfiles/cardframes.sql"),
                String::from("./sqlfiles/cardeffects.sql"),
                String::from("./sqlfiles/badges.sql")
            ]
        }
    }
}

pub fn get_figment() -> Result<Figment, figment::Error> {
    Ok(Figment::from(rocket::Config::default())
        .merge(Serialized::defaults(Config::default()))
        .merge(Json::file("Config.json").nested()))
}
