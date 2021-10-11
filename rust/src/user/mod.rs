pub mod notifications;
pub mod info;
mod register;
mod login;
mod users;
mod shared;

pub use shared::UserVerified;
pub use shared::UserRanking;

pub use register::register_route;
pub use login::login_route;
pub use notifications::notifications_route;
pub use users::users_route;
