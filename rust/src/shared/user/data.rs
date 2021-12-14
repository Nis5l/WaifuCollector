use serde_repr::Serialize_repr;
use sqlx::FromRow;
use serde::Serialize;

use crate::config::Config;
use crate::shared::DbParseError;
use crate::shared::Id;

#[derive(Debug)]
pub enum UserVerifiedDb {
    No = 0,
    Yes = 1
}

impl UserVerifiedDb {
    pub fn from_db(verified: i32) -> Result<Self, DbParseError> {
        match verified {
            0 => Ok(Self::No),
            1 => Ok(Self::Yes),
            _ => Err(DbParseError)
        }
    }
}

pub enum UserRanking {
    Standard = 0,
    Admin = 1
}

impl UserRanking {
    pub fn from_db(ranking: i32) -> Result<Self, DbParseError> {
        match ranking {
            0 => Ok(Self::Standard),
            1 => Ok(Self::Admin),
            _ => Err(DbParseError)
        }
    }
}

#[derive(Debug, Serialize_repr)]
#[repr(u8)]
pub enum UserVerified {
    Ok = 0,
    NotVerified = 1,
    MailNotSet = 2
}

impl UserVerified {
    pub fn from_db(email: &Option<String>, verified: i32) -> Result<Self, DbParseError> {
        if email.is_none() {
            Ok(Self::MailNotSet)
        } else if verified == 0 {
            Ok(Self::NotVerified)
        } else if verified == 1 {
            Ok(Self::Ok)
        } else {
            Err(DbParseError)
        }
    }
}

#[macro_export]
macro_rules! verify_user {
    ( $sql:expr, $token:expr ) => {
        {
            let vd = rocketjson::rjtry!(crate::shared::user::sql::get_verify_data($sql, $token).await);

            match rocketjson::rjtry!(crate::shared::user::data::UserVerified::from_db(&vd.email, vd.verified)) {
                crate::shared::user::data::UserVerified::NotVerified => return rocketjson::ApiResponseErr::api_err(rocket::http::Status::Unauthorized, String::from("Not verified")),
                crate::shared::user::data::UserVerified::MailNotSet => return rocketjson::ApiResponseErr::api_err(rocket::http::Status::Unauthorized, String::from("Mail not set")),
                crate::shared::user::data::UserVerified::Ok => ()
            }
        }
    };
}

pub fn validate_password(password: &str, config: &Config) -> Result<(), validator::ValidationError> {
	if password.len() < config.password_len_min as usize || password.len() > config.password_len_max as usize {
        return Err(validator::ValidationError::new("password does not fit the length constraints"));
    }

    Ok(())
}

#[derive(Debug, FromRow)]
pub struct EmailVerifiedDb {
    #[sqlx(rename="uverified")]
    pub verified: i32,
    #[sqlx(rename="uemail")]
    pub email: Option<String>
}

#[derive(Serialize)]
pub struct Badge {
    pub name: &'static str,
    pub asset: &'static str
}

//TODO: this is obv. a placeholder and should be stored in the database!
//8,3: Nissl and SmallCode
const DEVS: [Id; 2] = [8, 3];

pub fn get_badges(user_id: Id) -> Vec<Badge> {
    let mut badges = Vec::new();
    if DEVS.contains(&user_id) {
        badges.push(Badge {
			name: "Developer",
			asset: "/badges/dev.jpg"
        });
    }
    badges
}
