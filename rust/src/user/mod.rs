pub mod register;
pub mod login;
pub mod notifications;
pub mod users;
pub mod friends;
pub mod shared;

pub use shared::UserVerified;
pub use shared::UserRanking;

pub use register::register_route;
pub use login::login_route;
pub use notifications::notifications_route;
pub use users::users_route;
pub use friends::friends_route;
