use diesel::table;

table! {
    user (id) {
        id -> Integer,
        username -> Text,
        password -> Text,
        ranking -> Integer,
        email -> Text,
        verified -> Integer,
    }
}
