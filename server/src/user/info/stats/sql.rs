use crate::sql::Sql;
use crate::shared::Id;
use super::data::Achievement;

pub async fn get_user_card_count(sql: &Sql, user_id: Id) -> Result<i64, sqlx::Error> {
    let mut con = sql.get_con().await?;

    let (count, ): (i64, ) = sqlx::query_as(
        "SELECT COUNT(DISTINCT cid)
         FROM cardunlocks
         WHERE uid=?;")
        .bind(user_id)
        .fetch_one(&mut con)
        .await?;

    Ok(count)
}

pub async fn get_max_card_count(sql: &Sql) -> Result<i64, sqlx::Error> {
    let mut con = sql.get_con().await?;

    let (count, ): (i64, ) = sqlx::query_as(
        "SELECT COUNT(*)
         FROM cards")
        .fetch_one(&mut con)
        .await?;

    Ok(count)
}

pub async fn get_trades_on_cooldown_count(sql: &Sql, user_id: Id, cooldown: u32) -> Result<i64, sqlx::Error> {
    let mut con = sql.get_con().await?;

    let (count, ): (i64, ) = sqlx::query_as(
        "SELECT COUNT(*)
         FROM trades
         WHERE
         uidone = ? OR uidtwo = ?
         AND DATE_ADD(tlasttrade, INTERVAL ? SECOND) < NOW();")
        .bind(user_id)
        .bind(user_id)
        .bind(cooldown)
        .fetch_one(&mut con)
        .await?;

    Ok(count)
}

pub async fn get_achievements(sql: &Sql, user_id: Id) -> Result<Vec<Achievement>, sqlx::Error> {
    let mut con = sql.get_con().await?;

    let achievements: Vec<Achievement> = sqlx::query_as(
        "SELECT achievements.aimage as image, achievements.atext as text
         FROM achievementunlocks, achievements
         WHERE
         achievementunlocks.aid = achievements.aid AND
         achievementunlocks.uid = ?;")
        .bind(user_id)
        .fetch_all(&mut con)
        .await?;

    Ok(achievements)
}
