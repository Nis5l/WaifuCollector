use crate::sql::Sql;

pub async fn send_friend_request(sql: &Sql, user_id: i32, user_id_receiver: i32) -> Result<(), sqlx::Error> {
    let mut con = sql.get_con().await?;

    sqlx::query(
        "INSERT INTO friends
         (uidone, uidtwo, frstatus)
         VALUES
         (?, ?, 0)")
        .bind(user_id)
        .bind(user_id_receiver)
        .execute(&mut con)
        .await?;

    Ok(())
}
