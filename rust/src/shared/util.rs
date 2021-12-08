use chrono::{Duration, DateTime, Utc};

pub fn time_from_db(trade_time: Option<DateTime<Utc>>, trade_cooldown: u32) -> DateTime<Utc> {
    match trade_time {
        None => {
            return Utc::now();
        },
        Some(time) => {
            return time + Duration::seconds(trade_cooldown as i64);
        }
    }
}

pub fn escape_for_like(s: String) -> String {
    s.replace("!", "!!")
     .replace("%", "!%")
     .replace("_", "!_")
     .replace("[", "![")
}
