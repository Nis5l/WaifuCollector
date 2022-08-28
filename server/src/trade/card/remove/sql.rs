use sqlx::mysql::MySqlQueryResult;

use crate::sql::Sql;
use crate::shared::Id;

pub async fn delete_trade_card(sql: &Sql, user_id: Id, user_friend_id: Id, card_unlocked_id: Id) -> Result<bool, sqlx::Error> {
    let mut con = sql.get_con().await?;

    let result: MySqlQueryResult = sqlx::query(
        "DELETE FROM tradecards
         WHERE uidone=? AND uidtwo=? AND cuid=?;")
        .bind(user_id)
        .bind(user_friend_id)
        .bind(card_unlocked_id)
        .execute(&mut con)
        .await?;

    Ok(result.rows_affected() != 0)
}
