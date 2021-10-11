use chrono::{DateTime, Utc};

use crate::sql::Sql;

pub async fn get_pack_time(sql: &Sql, user_id: i32) -> Result<Option<DateTime<Utc>>, sqlx::Error> {

    let mut con = sql.get_con().await?;

    let stmt = sqlx::query_as(
        "SELECT lastOpened
         FROM packtime
         WHERE userID=?;")
        .bind(user_id)
        .fetch_one(&mut con)
        .await;

    if let Err(sqlx::Error::RowNotFound) = stmt {
        return Ok(None);
    }

    let (time, ): (Option<DateTime<Utc>>, ) = stmt?;

    Ok(time)
}
