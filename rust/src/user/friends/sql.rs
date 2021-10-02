use crate::sql::Sql;
use super::data::FriendDb;

pub async fn get_friends(sql: &Sql, in_user_id: i32) -> Result<Vec<FriendDb>, sqlx::Error> {

    let mut con = sql.get_con().await?;

    let friends: Vec<FriendDb> = sqlx::query_as(
        "SELECT userone, usertwo, friend_status
         FROM friends
         WHERE userone=? OR usertwo=?;")
        .bind(in_user_id)
        .bind(in_user_id)
        .fetch_all(&mut con)
        .await?;

    /* let data = sql.run(move |con| {
       friends
            .filter(userone.eq(in_user_id).or(usertwo.eq(in_user_id)))
            .select((userone, usertwo, friend_status))
            .load::<FriendDb>(con)
    }).await?; */

    Ok(friends)
}
