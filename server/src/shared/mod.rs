use std::error::Error;
use std::fmt;

pub mod card;
pub mod user;
pub mod friend;
pub mod notification;
pub mod trade;
pub mod util;
pub mod email;
pub mod crypto;
pub mod collector;

// TODO: 10 characters
pub type Id = String;
pub type IdInt = i32;

#[derive(Debug)]
pub struct DbParseError;

impl fmt::Display for DbParseError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "Error parsing from database")
    }
}

impl Error for DbParseError {}
