use figment::{Figment, providers::{Format, Json, Serialized}};
use crate::sql;

#[derive(Debug, serde::Deserialize, serde::Serialize)]
struct ReqConfig {
    pub sql_connection: String
}

#[derive(Debug, serde::Deserialize, serde::Serialize)]
pub struct Config {
    pub password_len_min: i32,
    pub password_len_max: i32,
    sql: sql::Sql
}

impl Config {
    fn new(sql_connection: String) -> Self {
        let sql = sql::Sql::new();

        Self {
            password_len_min: 4,
            password_len_max: 20,
            sql
        }
    }
}

pub fn get_figment() -> Result<Figment, _> {
    let config: ReqConfig = Figment::from(Json::file("../config.json")).extract()?;

    Ok(Figment::from(rocket::Config::default())
        .merge(Serialized::defaults(Config::new(config.sql_connection)))
        .merge(Json::file("../config.json").nested()))
        //.merge(Env::prefixed("APP_").global())
        //.select(Profile::from_env_or("APP_PROFILE", "default"));
}
