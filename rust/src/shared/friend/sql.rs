use crate::sql::Sql;
use super::data::{FriendDb, FriendUsernameDb};

pub async fn used_friend_slots(sql: &Sql, user_id: i32) -> Result<i64, sqlx::Error> {
    let mut con = sql.get_con().await?;

    let (count, ): (i64, ) = sqlx::query_as(
        "SELECT COUNT(*)
         FROM friends
         WHERE uidtwo=? AND frstatus=1 OR uidone=?;")
        .bind(user_id)
        .bind(user_id)
        .fetch_one(&mut con)
        .await?;

    Ok(count)
}


pub async fn user_friends_username(sql: &Sql, user_id: i32) -> Result<Vec<FriendUsernameDb>, sqlx::Error> {
    let mut con = sql.get_con().await?;

    let friends: Vec<FriendUsernameDb> = sqlx::query_as(
            "SELECT
             users.uusername AS username,
             friends.uidone AS userone,
             friends.uidtwo AS usertwo,
             friends.frstatus AS friendStatus
             FROM
             friends,
             users
             WHERE friends.uidone=? AND users.uid=friends.uidtwo
             UNION
             SELECT
             users.uusername AS username,
             friends.uidone AS userone,
             friends.uidtwo AS usertwo,
             friends.frstatus AS friendStatus
             FROM
             friends,
             users
             WHERE friends.uidtwo=? AND users.uid=friends.uidone;")
        .bind(user_id)
        .bind(user_id)
        .fetch_all(&mut con)
        .await?;

    Ok(friends)
}

pub async fn user_friend(sql: &Sql, user_id: i32, user_friend_id: i32) -> Result<Option<FriendDb>, sqlx::Error> {
    let mut con = sql.get_con().await?;

    let friends: Result<FriendDb, sqlx::Error> = sqlx::query_as(
            "SELECT
             friends.uidone AS userone,
             friends.uidtwo AS usertwo,
             friends.frstatus AS friendStatus
             FROM
             friends
             WHERE
             (friends.uidone=? AND friends.uidtwo=?) OR
             (friends.uidtwo=? AND friends.uidone=?);")
        .bind(user_id)
        .bind(user_friend_id)
        .bind(user_id)
        .bind(user_friend_id)
        .fetch_one(&mut con)
        .await;

    if let Err(sqlx::Error::RowNotFound) = friends {
        return Ok(None);
    }

    Ok(Some(friends?))
}
