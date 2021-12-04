use serde_repr::Serialize_repr;

#[derive(Debug)]
pub enum UserVerifiedDb {
    No = 0,
    Yes = 1
}

impl UserVerifiedDb {
    pub fn from_db(verified: i32) -> Result<Self, ()> {
        match verified {
            0 => Ok(Self::No),
            1 => Ok(Self::Yes),
            _ => Err(())
        }
    }
}

pub enum UserRanking {
    Standard = 0,
    Admin = 1
}

impl UserRanking {
    pub fn from_db(ranking: i32) -> Result<Self, ()> {
        match ranking {
            0 => Ok(Self::Standard),
            1 => Ok(Self::Admin),
            _ => Err(())
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
    pub fn from_db(email: &Option<String>, verified: i32) -> Result<Self, ()> {
        if email.is_none() {
            Ok(Self::MailNotSet)
        } else if verified == 0 {
            Ok(Self::NotVerified)
        } else if verified == 1 {
            Ok(Self::Ok)
        } else {
            Err(())
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

