use crate::sql::Sql;
use crate::shared::Id;
use super::data::CollectorFavorites;

pub async fn get_favorite_collectors(sql: &Sql, user_id: &Id) -> Result<Vec<CollectorFavorites>, sqlx::Error> {
    let mut con = sql.get_con().await?;

    let collectors: Vec<CollectorFavorites> = sqlx::query_as(
        "SELECT coid AS id, coname AS name
         FROM collectors, collectorfavorites
         WHERE collectors.coid=collectorfavorites.coid
         AND collectorfavorites.uid=?;")
        .bind(user_id)
        .fetch_all(&mut con)
        .await?;

    Ok(collectors)
}
