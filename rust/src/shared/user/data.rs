use serde_repr::Serialize_repr;
use sqlx::FromRow;

use crate::config::Config;
use crate::shared::DbParseError;

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
            match rocketjson::rjtry!(crate::shared::user::sql::user_verified($sql, $token).await) {
                Err(_) => return rocketjson::ApiResponseErr::api_err(rocket::http::Status::InternalServerError, String::from("Internal server error")),
                Ok(crate::shared::user::data::UserVerifiedDb::No) => return rocketjson::ApiResponseErr::api_err(rocket::http::Status::Unauthorized, String::from("Not verified")),
                Ok(crate::shared::user::data::UserVerifiedDb::Yes) => ()
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
