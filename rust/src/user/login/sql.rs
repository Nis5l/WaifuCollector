use crate::sql::{Sql, model::User, schema, function::*};

use diesel::prelude::*;

pub async fn get_user_password(sql: &Sql, in_username: String) -> Result<(i32, String, String), diesel::result::Error> {
    use schema::user::dsl::*;

    let data = sql.run(|con| {
        user
            .filter(username.eq(in_username))
            .select((id, username, password))
            .first::<(i32, String, String)>(con)
    }).await?;

    Ok(data)
}
