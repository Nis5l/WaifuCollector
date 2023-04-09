use crate::sql::Sql;
use crate::shared::Id;
use crate::shared::card::data::CardState;

pub async fn collector_type_request_accept(sql: &Sql, card_type_id: &Id) -> Result<(), sqlx::Error> {
    let mut con = sql.get_con().await?;

    sqlx::query("UPDATE cardtypes
                 SET ctstate=?
                 WHERE ctid=?
                 AND ctstate=?;")
        .bind(CardState::Created as i32)
        .bind(card_type_id)
        .bind(CardState::Requested as i32)
        .execute(&mut con)
        .await?;

    Ok(())
}
