use std::{fmt, convert, str};
use serde::{Serialize, Deserialize};
use rocket::request::FromParam;
use rocket::form::{self, FromForm};

use crate::shared::crypto::random_string::generate_random_string;

#[derive(Debug, Clone, sqlx::Type, Serialize, Deserialize, FromForm)]
#[sqlx(transparent)]
#[field(validate = to_lowercase())]
pub struct Id(String);

fn to_lowercase<'a>(str: &String) -> form::Result<'a, ()>{
    Ok(())
}

impl Id {
    pub fn new(len: usize) -> Self {
        Self(generate_random_string(len))
    }
}

impl convert::From<String> for Id {
    fn from(value: String) -> Self {
        Self(value.to_lowercase())
    }
}

impl convert::From<&str> for Id {
    fn from(value: &str) -> Self {
        Self(String::from(value).to_lowercase())
    }
}

impl std::ops::Deref for Id {
    type Target = String;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

impl PartialEq for Id {
    fn eq(&self, other: &Self) -> bool {
        self.0 == other.0
    }
}

impl fmt::Display for Id {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "Id({})", self.0)
    }
}

impl str::FromStr for Id {
    type Err = ();

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        Ok(Self::from(s))
    }
}

impl<'a> FromParam<'a> for Id {
    type Error = ();

    fn from_param(param: &'a str) -> Result<Self, Self::Error> {
        Ok(Self::from(param))
    }
}
