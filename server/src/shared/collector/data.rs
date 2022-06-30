use serde::Serialize;
use sqlx::FromRow;
use crate::shared::Id;

#[derive(Debug, Serialize, FromRow)]
pub struct Collector {
    pub id: Id,
    pub name: String
}

#[macro_export]
macro_rules! verify_collector {
    ( $sql:expr, $collector_id:expr ) => {
        let collector_exists = rocketjson::rjtry!(crate::shared::collector::sql::collector_exists($sql, $collector_id).await);
        if (!collector_exists) {
            return rocketjson::ApiResponseErr::api_err(rocket::http::Status::NotFound, format!("Collector {} not found", $collector_id));
        }
    };
}
