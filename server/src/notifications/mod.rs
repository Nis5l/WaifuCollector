mod logic;
mod sql;
mod data;
mod delete;
mod deleteall;

pub use logic::notifications_route;
pub use delete::notifications_delete_route;
pub use deleteall::notifications_delete_all_route;
