mod model;
mod schema;

use crate::sql::Sql;

use diesel::prelude::*;

pub async fn email_exists(sql: &Sql, in_email: String) -> Result<bool, diesel::result::Error> {
    use schema::user::dsl::*;

    let count: i64 = sql.run(|c| {
        user
            .filter(email.eq(in_email))
            .count()
            .first(c)
    }).await?;

    Ok(count != 0)
}

pub async fn user_exists(sql: &Sql, in_username: String) -> Result<bool, diesel::result::Error> {
    use schema::user::dsl::*;

    let count: i64 = sql.run(|c| {
        user
            .filter(username.eq(in_username))
            .count()
            .first(c)
    }).await?;

    Ok(count != 0)
}

/*
pub async fn register(sql: &Sql, username: String, password: String, email: String) -> Result<bool, diesel::result::Error> {
    use schema::user::dsl::*;


}
*/
