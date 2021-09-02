use validator::ValidationError;
use crate::config;
use regex::Regex;
use std::borrow::Cow;

#[derive(Debug, serde::Deserialize, validator::Validate, rocketjson::JsonBody)]
//#[derive(Debug, serde::Deserialize, validator::Validate)]
pub struct RegisterRequest {
    #[validate(custom(function="validate_username", arg="&'v_a config::Config"))]
    pub username: String,
    #[validate(custom(function="validate_password", arg="&'v_a config::Config"))]
    pub password: String,
    #[validate(email)]
    pub mail: String
}

#[derive(serde::Serialize)]
pub struct RegisterResponse {
    message: String
}

impl RegisterResponse {
    pub fn new(message: String) -> Self {
        Self {
            message
        }
    }
}

fn validate_username(username: &str, config: &config::Config) -> Result<(), ValidationError> {
	if username.len() < config.username_len_min as usize || username.len() > config.username_len_max as usize {
        let mut err = ValidationError::new("username does not fit the length constraints");
        err.add_param(Cow::from("min"), &config.username_len_min);
        err.add_param(Cow::from("max"), &config.username_len_max);

        return Err(err);
    }
    let re = Regex::new("^[a-zA-Z0-9_]+$").unwrap();

    if !re.is_match(username) {
        return Err(ValidationError::new("user can only contain letters, numbers and _"));
    }

    Ok(())
}

fn validate_password(password: &str, config: &config::Config) -> Result<(), validator::ValidationError> {
	if password.len() < config.password_len_min as usize || password.len() > config.password_len_max as usize {
        return Err(validator::ValidationError::new("password does not fit the length constraints"));
    }

    Ok(())
}
