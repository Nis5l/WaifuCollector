use crate::sql::{Sql, model::Notification};

pub async fn get_notifications(sql: &Sql, in_user_id: i32) -> Result<Vec<Notification>, ()> {
    /*
    let data = sql.run(move |con| {
       notification 
            .filter(user_id.eq(in_user_id))
            .limit(5)
            .load::<Notification>(con)
    }).await?;
    */

    Ok(Vec::new())
}
