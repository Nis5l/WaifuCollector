use validator::ValidationError;
use regex::Regex;

#[derive(serde::Deserialize, validator::Validate, rocketjson::JsonBody)]
pub struct RegisterRequest {
    #[validate(custom="validate_username")]
    pub username: String,
    #[validate(custom="validate_password")]
    pub password: String,
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

fn validate_username(username: &str) -> Result<(), ValidationError> {
    //TODO: config
	if username.len() < 4 || username.len() > 20 {
        println!("username wrong");
        return Err(ValidationError::new("username length must be between 4 and 20"));
    }
    let re = Regex::new("^[a-zA-Z0-9_]+$").unwrap();

    if !re.is_match(username) {
        return Err(ValidationError::new("user can only contain letters, numbers and _"));
    }

    Ok(())
}

fn validate_password(password: &str) -> Result<(), validator::ValidationError> {
    //TODO: config
	if password.len() < 8 || password.len() > 30 {
        return Err(validator::ValidationError::new("password length must be between 8 and 30"));
    }

    Ok(())
}
