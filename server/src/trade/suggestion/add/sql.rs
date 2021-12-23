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
