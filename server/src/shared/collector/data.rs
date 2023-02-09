use serde::Serialize;
use sqlx::FromRow;
use crate::shared::Id;

//TODO: creation date
#[derive(Debug, Serialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct Collector {
    pub id: Id,
    pub name: String,
    #[sqlx(rename="userId")]
    pub user_id: Id
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

pub enum CollectorSetting {
    PackCooldown,
    PackAmount,
    PackQualityMin,
    PackQualityMax,
    TradeCooldown,
    TradeCardLimit
}

impl std::string::ToString for CollectorSetting {
    fn to_string(&self) -> String {
        String::from(match self {
            PackCooldown => "pack_cooldown",
            PackAmount => "pack_amount",
            PackQualityMin => "pack_quality_min",
            PackQualityMax => "pack_quality_max",
            TradeCooldown => "trade_cooldown",
            TradeCardLimit => "trade_card_limit"
        })
    }
}
