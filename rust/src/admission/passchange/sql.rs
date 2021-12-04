use crate::sql::Sql;
use crate::shared::Id;

pub async fn change_password(sql: &Sql, user_id: Id, new_password_hashed: &str) -> Result<(), sqlx::Error> {
    let mut con = sql.get_con().await?;

    sqlx::query(
        "UPDATE users
         SET upassword=?
         WHERE uid=?;")
        .bind(new_password_hashed)
        .bind(user_id)
        .execute(&mut con)
        .await?;

    Ok(())
}
