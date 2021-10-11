use sqlx::{Pool, MySql, pool::PoolConnection, Error};
use core::future::Future;

pub struct Sql(pub Pool<MySql>);

impl Sql {
    pub fn get_con(&self) -> impl Future<Output = Result<PoolConnection<MySql>, Error>> + 'static {
        self.0.acquire()
    }
}
