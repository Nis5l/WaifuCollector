use crate::sql::Sql;
use crate::shared::Id;
use super::data::TradeStatus;

pub async fn set_trade_status(sql: &Sql, user_id: Id, user_friend_id: Id, status: TradeStatus) -> Result<(), sqlx::Error> {
    let mut con = sql.get_con().await?;

    sqlx::query(
        "UPDATE trades
         SET tstatusone=?, tstatustwo=?
         WHERE (uidone=? AND uidtwo=?) OR (uidtwo=? AND uidone=?);")
        .bind(status as i32)
        .bind(status as i32)
        .bind(user_id)
        .bind(user_friend_id)
        .bind(user_id)
        .bind(user_friend_id)
        .execute(&mut con)
        .await?;

    Ok(())
}
