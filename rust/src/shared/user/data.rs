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

