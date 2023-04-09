use crate::sql::Sql;
use crate::shared::Id;
use crate::shared::card::data::CardState;

pub async fn collector_type_request_decline(sql: &Sql, card_type_id: &Id) -> Result<(), sqlx::Error> {
    let mut con = sql.get_con().await?;

    sqlx::query("DELETE FROM cardtypes
                 WHERE ctid=?
                 AND ctstate=?;")
        .bind(card_type_id)
        .bind(CardState::Requested as i32)
        .execute(&mut con)
        .await?;

    Ok(())
}
