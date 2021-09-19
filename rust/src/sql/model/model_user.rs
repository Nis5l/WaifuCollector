#[derive(Queryable)]
pub struct User {
    pub id: i32,
    pub username: String,
    pub password: String,
    pub ranking: i32,
    pub email: String,
    pub verified: i32
}
