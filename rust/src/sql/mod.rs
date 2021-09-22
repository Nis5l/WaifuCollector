pub mod schema;
pub mod model;
pub mod function;

#[rocket_sync_db_pools::database("my_db")]
pub struct Sql(diesel::MysqlConnection);
