use chrono::{DateTime, Utc};

use crate::sql::Sql;
use crate::shared::Id;

pub async fn get_pack_time(sql: &Sql, user_id: Id) -> Result<Option<DateTime<Utc>>, sqlx::Error> {

    let mut con = sql.get_con().await?;

    let stmt = sqlx::query_as(
        "SELECT ptlastopened AS lastOpened
         FROM packtimes
         WHERE uid=?;")
        .bind(user_id)
        .fetch_one(&mut con)
        .await;

    if let Err(sqlx::Error::RowNotFound) = stmt {
        return Ok(None);
    }

    let (time, ): (Option<DateTime<Utc>>, ) = stmt?;

    Ok(time)
}
