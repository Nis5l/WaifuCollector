use diesel::table;

table! {
    notification (id) {
        id -> Integer,
        #[sql_name = "userId"]
        user_id -> Integer,
        title -> Text,
        message -> Text,
        url -> Text,
        time -> BigInt,
    }
}
