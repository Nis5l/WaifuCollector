mod register;
mod login;
mod notifications;
mod users;
mod shared;
pub mod info;

pub use shared::UserVerified;
pub use shared::UserRanking;

pub use register::register_route;
pub use login::login_route;
pub use notifications::notifications_route;
pub use users::users_route;
