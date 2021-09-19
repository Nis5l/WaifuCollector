use figment::{Figment, providers::{Format, Json, Serialized}};

#[derive(Debug, serde::Deserialize, serde::Serialize)]
pub struct SqlConfig {
    url: String,
    pool_size: i32
}

impl SqlConfig {
    pub fn new(url: String, pool_size: i32) -> Self {
        Self {
            url,
            pool_size
        }
    }
}

#[derive(Debug, serde::Deserialize, serde::Serialize)]
pub struct Config {
    pub username_len_min: u32,
    pub username_len_max: u32,

    pub password_len_min: u32,
    pub password_len_max: u32,

    pub jwt_secret: String,

    pub databases: figment::value::Map<String, SqlConfig>
}

impl Default for Config {
    fn default() -> Self {
        let db = SqlConfig::new(String::from("db"), 10);

        let databases = figment::util::map![String::from("my_db") => db];

        Self {
            username_len_min: 4,
            username_len_max: 20,

            password_len_min: 8,
            password_len_max: 30,

            jwt_secret: String::from("CHANGE_THE_SECRET"),

            databases
        }
    }
}

pub fn get_figment() -> Result<Figment, figment::Error> {
    Ok(Figment::from(rocket::Config::default())
        .merge(Serialized::defaults(Config::default()))
        .merge(Json::file("Config.json").nested()))
}
