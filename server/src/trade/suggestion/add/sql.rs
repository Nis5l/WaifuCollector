use crate::sql::Sql;
use crate::shared::Id;

pub async fn trade_suggestion_add(sql: &Sql, trade_id: &Id, card_unlocked_id: &Id) -> Result<(), sqlx::Error> {
    let mut con = sql.get_con().await?;

    sqlx::query(
        "INSERT INTO tradesuggestions
         (tid, cuid)
         VALUES
         (?, ?);")
        .bind(trade_id)
        .bind(card_unlocked_id)
        .execute(&mut con)
        .await?;

    Ok(())
}
