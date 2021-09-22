use diesel::sql_types;

sql_function!(fn lower(x: sql_types::Text) -> sql_types::Text);
no_arg_sql_function!(last_insert_id, sql_types::Bigint);
