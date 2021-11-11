use serde_repr::Serialize_repr;
use serde::Serialize;
use sqlx::FromRow;

#[derive(Debug, Serialize_repr)]
#[repr(u8)]
pub enum Verified {
    Ok = 0,
    NotVerified = 1,
    MailNotSet = 2
}

#[derive(Debug, FromRow)]
pub struct VerifiedDb {
    #[sqlx(rename="uverified")]
    pub verified: i32,
    #[sqlx(rename="uemail")]
    pub email: Option<String>
}

impl Verified {
    pub fn from_db(db_result: &VerifiedDb) -> Result<Self, ()> {
        if db_result.email.is_none() {
            Ok(Self::MailNotSet)
        } else if db_result.verified == 0 {
            Ok(Self::NotVerified)
        } else if db_result.verified == 1 {
            Ok(Self::Ok)
        } else {
            Err(())
        }
    }
}

#[derive(Debug, Serialize)]
pub struct VerifiedResponse {
    pub verified: Verified,
    pub email: Option<String>
}
