use chrono::{DateTime, Utc};

use crate::sql::Sql;
use crate::shared::Id;

pub async fn last_trade_time(sql: &Sql, user_id: &Id, user_friend_id: &Id) -> Result<Option<DateTime<Utc>>, sqlx::Error> {
    let mut con = sql.get_con().await?;

    let (last_trade_time,): (Option<DateTime<Utc>>,) = sqlx::query_as(
        "SELECT tlasttrade
         FROM trades
         WHERE (uidone=? AND uidtwo=?) OR (uidtwo=? AND uidone=?);")
        .bind(user_id)
        .bind(user_friend_id)
        .bind(user_id)
        .bind(user_friend_id)
        .fetch_one(&mut con)
        .await?;

    Ok(last_trade_time)
}
