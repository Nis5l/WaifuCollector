use crate::sql::{Sql, model, schema, function::*};

use diesel::{insert_into, select};
use diesel::prelude::*;

pub async fn email_exists(sql: &Sql, in_email: String) -> Result<bool, diesel::result::Error> {
    use schema::user::dsl::*;

    let count: i64 = sql.run(|con| {
        user
            .filter(email.eq(in_email))
            .count()
            .first(con)
    }).await?;

    Ok(count != 0)
}

pub async fn user_exists(sql: &Sql, in_username: String) -> Result<bool, diesel::result::Error> {
    use schema::user::dsl::*;

    let count: i64 = sql.run(|con| {
        user
            .filter(lower(username).eq(in_username))
            .count()
            .first(con)
    }).await?;

    Ok(count != 0)
}

pub async fn register(sql: &Sql, in_username: String, in_password_hash: String, in_email: String) -> Result<i64, diesel::result::Error> {
    use schema::user::dsl::*;

    let inserted_id: i64 = sql.run(move |con| {
        let affected_rows = insert_into(user)
            .values((
                id.eq(0),
                username.eq(in_username),
                password.eq(in_password_hash),
                email.eq(in_email),
                ranking.eq(0),
                verified.eq(0)
            ))
            .execute(con)?;

        if affected_rows == 0 {
            return Err(diesel::result::Error::DatabaseError(
                        diesel::result::DatabaseErrorKind::UniqueViolation,
                        Box::new(String::from("No affected rows on register"))
                    ));
        }

        select(last_insert_id).first(con)
    }).await?;

    Ok(inserted_id)
}
