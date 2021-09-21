use crate::config::Config;

use jwt::{SignWithKey, VerifyWithKey};
use hmac::{Hmac, NewMac};
use sha2::Sha256;
use std::collections::BTreeMap;
use rocket::request::{self, FromRequest, Request};
use rocket::http::Status;
use rocketjson::error::JsonBodyError;

pub struct JwtToken {
    pub username: String,
    pub id: i32
}

impl JwtToken {
    pub fn new(username: String, id: i32) -> Self {
        JwtToken {
            username,
            id
        }
    }
}

#[rocket::async_trait]
impl<'r> FromRequest<'r> for JwtToken {
    type Error = ();

    async fn from_request(req: &'r Request<'_>) -> request::Outcome<Self, Self::Error> {
        let token = req.headers().get_one("token");
        match token {
          Some(token_str) => {
            let token = jwt_verify_token(token_str, &req.rocket().state::<Config>().expect("Config not found in state").jwt_secret);

            if token.is_err() {
                req.local_cache(|| JsonBodyError::CustomError(String::from("Invalid authorization token")));
                return request::Outcome::Failure((Status::Unauthorized, ()));
            }

            request::Outcome::Success(token.unwrap())
          },
          None => {
              req.local_cache(|| JsonBodyError::CustomError(String::from("Authorization token missing")));
              request::Outcome::Failure((Status::Unauthorized, ()))
          }
        }
    }
}

pub fn jwt_sign_token(username: &str, user_id: i32, secret: &str) -> Result<String, jwt::Error> {
    let key: Hmac<Sha256> = Hmac::new_from_slice(&bincode::serialize(secret).expect("Serializing jwt secret failed!"))?;
    let mut btree = BTreeMap::new();
    let user_id_str = user_id.to_string();
    btree.insert("username", username);
    btree.insert("id", &user_id_str);
    //TODO: expires in 1 month
    btree.sign_with_key(&key)
}

pub fn jwt_verify_token(token: &str, secret: &str) -> Result<JwtToken, jwt::Error> {
    let key: Hmac<Sha256> = Hmac::new_from_slice(&bincode::serialize( secret).expect("Serializing jwt secret failed!"))?;
    let btree: BTreeMap<String, String> = token.verify_with_key(&key)?;

    let username = btree.get("username");
    let user_id_str = btree.get("username");

    if username.is_none() || user_id_str.is_none() {
        return Err(jwt::Error::Format);
    }

    let user_id = user_id_str.unwrap().parse::<i32>();

    if user_id.is_err() {
        return Err(jwt::Error::Format);
    }

    Ok(JwtToken::new(username.unwrap().clone(), user_id.unwrap()))
}
