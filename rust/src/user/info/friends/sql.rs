use crate::sql::Sql;
use super::data::FriendDb;

pub async fn get_user_friends(sql: &Sql, sent: bool, user_id: i32) -> Result<Vec<FriendDb>, sqlx::Error> {
    let mut con = sql.get_con().await?;

    let where_clause = if sent {
        "WHERE friends.uidone=? AND users.uid=friends.uidtwo;"
    } else {
        "WHERE friends.uidtwo=? AND users.uid=friends.uidone;"
    };

    let friends: Vec<FriendDb> = sqlx::query_as(&format!(
            "SELECT
            users.uusername AS username,
            friends.uidone AS userone,
            friends.uidtwo AS usertwo,
            friends.frstatus AS friendStatus
            FROM friends, users
            {}", where_clause))
        .bind(user_id)
        .fetch_all(&mut con)
        .await?;

    Ok(friends)
}
