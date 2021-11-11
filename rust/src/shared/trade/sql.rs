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

pub async fn card_in_trade(sql: &Sql, card_unlocked_id: Id) -> Result<bool, sqlx::Error> {
    let mut con = sql.get_con().await?;

    let (count, ): (i64, ) = sqlx::query_as(
        "SELECT COUNT(*)
         FROM tradecards
         WHERE cuid=?;")
        .bind(card_unlocked_id)
        .fetch_one(&mut con)
        .await?;

    Ok(count != 0)
}

pub async fn trade_add_card(sql: &Sql, user_id: Id, user_id_friend: Id, card_unlocked_id: Id) -> Result<(), sqlx::Error> {
    let mut con = sql.get_con().await?;

    sqlx::query(
        "INSERT INTO tradecards
         (uidone, uidtwo, cuid)
         VALUES
         (?, ?, ?);")
        .bind(user_id)
        .bind(user_id_friend)
        .bind(card_unlocked_id)
        .execute(&mut con)
        .await?;

    Ok(())
}

pub async fn suggestion_in_trade(sql: &Sql, user_id: Id, user_friend_id: Id, card_unlocked_id: Id) -> Result<bool, sqlx::Error> {
    let mut con = sql.get_con().await?;

    let (count, ): (i64, ) = sqlx::query_as(
        "SELECT COUNT(*)
         FROM tradesuggestions
         WHERE uidone=? AND uidtwo=? AND cuid=?;")
        .bind(user_id)
        .bind(user_friend_id)
        .bind(card_unlocked_id)
        .fetch_one(&mut con)
        .await?;

    Ok(count != 0)
}
