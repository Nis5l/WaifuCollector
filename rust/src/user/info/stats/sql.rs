use crate::sql::Sql;

pub async fn get_user_friend_count(sql: &Sql, user_id: u32) -> Result<u32, sqlx::Error> {
    let mut con = sql.get_con().await?;

    let (count, ): (u32, ) = sqlx::query_as(
        "SELECT COUNT(*)
         FROM friends
         WHERE userone=? OR usertwo=? AND friendStatus=2;")
        .bind(user_id)
        .bind(user_id)
        .fetch_one(&mut con)
        .await?;

    Ok(count)
}


pub async fn get_user_card_count(sql: &Sql, user_id: u32) -> Result<u32, sqlx::Error> {
    let mut con = sql.get_con().await?;

    let (count, ): (u32, ) = sqlx::query_as(
        "SELECT COUNT(DISTINCT cardID)
         FROM unlocked
         WHERE userId=?;")
        .bind(user_id)
        .fetch_one(&mut con)
        .await?;

    Ok(count)
}

pub async fn get_max_card_count(sql: &Sql) -> Result<u32, sqlx::Error> {
    let mut con = sql.get_con().await?;

    let (count, ): (u32, ) = sqlx::query_as(
        "SELECT COUNT(*)
         FROM card")
        .fetch_one(&mut con)
        .await?;

    Ok(count)
}
