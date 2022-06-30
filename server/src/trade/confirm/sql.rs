use sqlx::Acquire;
use sqlx::mysql::MySqlQueryResult;
use chrono::Utc;

use crate::sql::Sql;
use crate::shared::Id;

//transfers the cards, clears the trade and sets the cooldown
pub async fn complete_trade(sql: &Sql, user_id: &Id, user_friend_id: &Id) -> Result<u64, sqlx::Error> {
    let mut con = sql.get_con().await?;
    let mut transaction = con.begin().await?;

    let query =
        "UPDATE cardunlocks
         SET uid=?
         WHERE cuid IN (
            SELECT cuid
            FROM tradecards
            WHERE uidone=? AND uidtwo=?);";

    let mut transfered_card_count = 0;

    transfered_card_count += (sqlx::query(query)
        .bind(user_friend_id)
        .bind(user_id)
        .bind(user_friend_id)
        .execute(&mut transaction)
        .await? as MySqlQueryResult).rows_affected();

    transfered_card_count += (sqlx::query(query)
        .bind(user_id)
        .bind(user_friend_id)
        .bind(user_id)
        .execute(&mut transaction)
        .await? as MySqlQueryResult).rows_affected();

    sqlx::query(
        "DELETE FROM tradecards
         WHERE (uidone=? AND uidtwo=?) OR (uidtwo=? AND uidone=?)")
        .bind(user_id)
        .bind(user_friend_id)
        .bind(user_id)
        .bind(user_friend_id)
        .execute(&mut transaction)
        .await?;

    sqlx::query(
        "DELETE FROM tradesuggestions
         WHERE (uidone=? AND uidtwo=?) OR (uidtwo=? AND uidone=?)")
        .bind(user_id)
        .bind(user_friend_id)
        .bind(user_id)
        .bind(user_friend_id)
        .execute(&mut transaction)
        .await?;

    sqlx::query(
        "UPDATE trades
         SET tlasttrade=?
         WHERE (uidone=? AND uidtwo=?) OR (uidtwo=? AND uidone=?)")
        .bind(Utc::now())
        .bind(user_id)
        .bind(user_friend_id)
        .bind(user_id)
        .bind(user_friend_id)
        .execute(&mut transaction)
        .await?;

    transaction.commit().await?;

    Ok(transfered_card_count)
}
