use crate::sql::Sql;

pub async fn get_user_friend_count(sql: &Sql, user_id: u32) -> Result<u32, sqlx::Error> {
    let mut con = sql.get_con().await?;

    let (count, ): (u32, ) = sqlx::query_as(
        "SELECT COUNT(*)
         FROM friends
         WHERE uidone=? OR uidtwo=? AND frstatus=2;")
        .bind(user_id)
        .bind(user_id)
        .fetch_one(&mut con)
        .await?;

    Ok(count)
}


pub async fn get_user_card_count(sql: &Sql, user_id: u32) -> Result<u32, sqlx::Error> {
    let mut con = sql.get_con().await?;

    let (count, ): (u32, ) = sqlx::query_as(
        "SELECT COUNT(DISTINCT cid)
         FROM unlockedcards
         WHERE uid=?;")
        .bind(user_id)
        .fetch_one(&mut con)
        .await?;

    Ok(count)
}

pub async fn get_max_card_count(sql: &Sql) -> Result<u32, sqlx::Error> {
    let mut con = sql.get_con().await?;

    let (count, ): (u32, ) = sqlx::query_as(
        "SELECT COUNT(*)
         FROM cards")
        .fetch_one(&mut con)
        .await?;

    Ok(count)
}
