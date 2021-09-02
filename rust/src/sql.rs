pub struct Sql {
    pool: mysql::Pool
}

impl Sql {
    pub fn new(url: &str) -> Self {
        //TODO: dont panic
        let urlopt = mysql::Opts::from_url(url).unwrap();
        let pool = mysql::Pool::new(urlopt).unwrap();

        Self {
            pool
        }
    }

    //TODO: dont panic
    pub fn get_connection(&self) -> Result<mysql::PooledConn, mysql::Error> {
        let conn = self.pool.get_conn()?;

        Ok(conn)
    }
}
