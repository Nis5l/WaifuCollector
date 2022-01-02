use sqlx::{Pool, MySql, pool::PoolConnection, Error};
use core::future::Future;
use std::fs;

#[derive(Debug, Clone)]
pub struct Sql(pub Pool<MySql>);

impl Sql {
    pub fn get_con(&self) -> impl Future<Output = Result<PoolConnection<MySql>, Error>> + 'static {
        self.0.acquire()
    }
}

//TODO: find a better solution
pub async fn setup_db(sql: &Sql, file: &str) -> Result<(), sqlx::Error> {
    let mut con = sql.get_con().await?;

    let file_sql = fs::read_to_string(file)
        .expect("Failed reading file");

    let queries = file_sql.split(";");

    for query in queries {
        let prepared_query = String::from(query.trim()) + ";";
        if prepared_query.len() == 1 { continue; }

        let result = sqlx::query(&prepared_query)
            .execute(&mut con)
            .await;

        if result.is_ok() {
            println!("{}", prepared_query);
        }
    }

    Ok(())
}
