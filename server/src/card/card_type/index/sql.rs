use crate::sql::Sql;
use crate::shared::{util, Id};
use crate::shared::card::data::{CardType, CardState};

pub async fn get_card_types(sql: &Sql, collector_id: &Id, mut name: String, amount: u32, offset: u32, state: Option<CardState>) -> Result<Vec<CardType>, sqlx::Error> {
    let mut con = sql.get_con().await?;

    name = util::escape_for_like(name);

    let query = format!(
        "SELECT
         ctid as id,
         uid as userId,
         ctname as name
         FROM cardtypes
         WHERE ctname LIKE CONCAT('%', ?, '%') AND
         coid = ?
         {}
         LIMIT ? OFFSET ?;",
             match state {
                Some(_) => "AND ctstate = ?",
                None => ""
            }
        );

    let mut stmt = sqlx::query_as(&query)
        .bind(name)
        .bind(collector_id);

    if let Some(state) = state {
        stmt = stmt.bind(state as i32);
    }

    stmt = stmt.bind(amount).bind(offset);

    let card_types: Vec<CardType> = stmt.fetch_all(&mut con).await?;

    Ok(card_types)
}
