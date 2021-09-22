use diesel::table;

table! {
    notification (id) {
        id -> Integer,
        user_id -> Integer,
        title -> Text,
        message -> Text,
        url -> Text,
        time -> BigInt,
    }
}
