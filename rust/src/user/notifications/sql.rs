use crate::sql::{Sql, model::Notification, schema, function::*};

use diesel::prelude::*;

pub async fn get_notifications(sql: &Sql, in_user_id: i32) -> Result<Vec<Notification>, diesel::result::Error> {
    use schema::notification::dsl::*;

    let data = sql.run(move |con| {
       notification 
            .filter(user_id.eq(in_user_id))
            .limit(5)
            //.select()
            .load::<Notification>(con)
    }).await?;

    Ok(data)
}
