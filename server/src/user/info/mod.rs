mod username;
mod friends;
mod badges;
mod stats;
mod rank;

pub use username::user_username_route;
pub use friends::user_friends_route;
pub use badges::user_badges_route;
pub use stats::user_stats_route;
pub use rank::user_rank_route;
