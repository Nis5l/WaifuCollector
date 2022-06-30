use sqlx::Acquire;

use crate::sql::Sql;
use crate::shared::Id;
use super::data::{TradeStatus, TradeDb};

pub async fn set_trade_status(sql: &Sql, user_id: &Id, user_friend_id: &Id, status_self: TradeStatus, status_friend: TradeStatus) -> Result<(), sqlx::Error> {
    let mut con = sql.get_con().await?;
    let mut transaction = con.begin().await?;

    let query =
        "UPDATE trades
         SET tstatusone=?, tstatustwo=?
         WHERE uidone=? AND uidtwo=?;";

    sqlx::query(query)
        .bind(status_self as i32)
        .bind(status_friend as i32)
        .bind(user_id)
        .bind(user_friend_id)
        .execute(&mut transaction)
        .await?;

    sqlx::query(query)
        .bind(status_friend as i32)
        .bind(status_self as i32)
        .bind(user_friend_id)
        .bind(user_id)
        .execute(&mut transaction)
        .await?;

    transaction.commit().await?;

    Ok(())
}

pub async fn set_trade_status_one(sql: &Sql, user_id: &Id, user_friend_id: &Id, status_self: TradeStatus) -> Result<(), sqlx::Error> {
    let mut con = sql.get_con().await?;
    let mut transaction = con.begin().await?;

    let query =
        "UPDATE trades
         SET tstatusone=?
         WHERE uidone=? AND uidtwo=?;";

    sqlx::query(query)
        .bind(status_self as i32)
        .bind(user_id)
        .bind(user_friend_id)
        .execute(&mut transaction)
        .await?;

    sqlx::query(query)
        .bind(status_self as i32)
        .bind(user_friend_id)
        .bind(user_id)
        .execute(&mut transaction)
        .await?;

    transaction.commit().await?;

    Ok(())
}

pub async fn card_in_trade(sql: &Sql, card_unlocked_id: &Id) -> Result<bool, sqlx::Error> {
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

pub async fn trade_add_card(sql: &Sql, user_id: &Id, user_id_friend: &Id, card_unlocked_id: &Id) -> Result<(), sqlx::Error> {
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

pub async fn suggestion_in_trade(sql: &Sql, user_id: &Id, user_friend_id: &Id, card_unlocked_id: &Id) -> Result<bool, sqlx::Error> {
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

//TODO: this has to be called not just by confirm
pub async fn create_trade(sql: &Sql, id: &Id, user_id: &Id, user_friend_id: &Id) -> Result<bool, sqlx::Error> {
    let mut con = sql.get_con().await?;

    let (count, ): (i64, ) = sqlx::query_as(
        "SELECT COUNT(*)
         FROM trades
         WHERE (uidone=? AND uidtwo=?) OR (uidtwo=? AND uidone=?);")
        .bind(user_id)
        .bind(user_friend_id)
        .bind(user_id)
        .bind(user_friend_id)
        .fetch_one(&mut con)
        .await?;

    if count != 0 {
        return Ok(false);
    }

    sqlx::query(
        "INSERT INTO trades
         (tid, uidone, uidtwo, tstatusone, tstatustwo)
         VALUES
         (?, ?, ?, 0, 0)")
        .bind(id)
        .bind(user_id)
        .bind(user_friend_id)
        .execute(&mut con)
        .await?;

    Ok(true)
}

pub async fn get_trade(sql: &Sql, user_id: &Id, user_id_friend: &Id) -> Result<TradeDb, sqlx::Error> {
    let mut con = sql.get_con().await?;

    sqlx::query_as(
        "SELECT trades.tstatusone as selfStatus, trades.tstatustwo as friendStatus, trades.tlasttrade as lastTrade
         FROM trades
         WHERE trades.uidone=? AND trades.uidtwo=?
         UNION
         SELECT trades.tstatustwo as selfStatus, trades.tstatusone as friendStatus, trades.tlasttrade as lastTrade
         FROM trades
         WHERE trades.uidtwo=? AND trades.uidone=?")
        .bind(user_id)
        .bind(user_id_friend)
        .bind(user_id)
        .bind(user_id_friend)
        .fetch_one(&mut con)
        .await
}
