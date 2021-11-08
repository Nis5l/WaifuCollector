use crate::sql::Sql;
use crate::shared::Id;

pub async fn trade_suggestion_add(sql: &Sql, user_id: Id, user_friend_id: Id, card_unlocked_id: Id) -> Result<(), sqlx::Error> {
    let mut con = sql.get_con().await?;

    sqlx::query(
        "INSERT INTO tradesuggestions
         (uidone, uidtwo, cuid)
         VALUES
         (?, ?, ?);")
        .bind(user_id)
        .bind(user_friend_id)
        .bind(card_unlocked_id)
        .execute(&mut con)
        .await?;

    Ok(())
}

pub async fn trade_suggestion_in_trade(sql: &Sql, user_id: Id, user_friend_id: Id, card_unlocked_id: Id) -> Result<bool, sqlx::Error> {
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
