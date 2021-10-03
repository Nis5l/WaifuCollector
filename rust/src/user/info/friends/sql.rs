use crate::sql::Sql;
use super::data::FriendDb;

pub async fn get_user_friends(sql: &Sql, sent: bool, user_id: i32) -> Result<Vec<FriendDb>, sqlx::Error> {
    let mut con = sql.get_con().await?;

    let where_clause = if sent {
        "WHERE friends.userone=? AND users.id=friends.usertwo;"
    } else {
        "WHERE friends.usertwo=? AND users.id=friends.userone;"
    };

    let friends: Vec<FriendDb> = sqlx::query_as(
        &format!("SELECT
            users.username,
            friends.userone,
            friends.usertwo,
            friends.friendStatus
         FROM friends, users
         {}", where_clause))
        .bind(user_id)
        .fetch_all(&mut con)
        .await.unwrap();

    Ok(friends)
}
