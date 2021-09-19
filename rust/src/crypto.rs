use crate::config::Config;

use jwt::{SignWithKey, VerifyWithKey};
use hmac::{Hmac, NewMac};
use sha2::Sha256;
use std::collections::BTreeMap;

pub struct JwtData {
    pub username: String,
    pub id: i32
}

impl JwtData {
    pub fn new(username: String, id: i32) -> Self {
        JwtData {
            username,
            id
        }
    }
}

pub fn bcrypt_hash(password: &str) -> bcrypt::BcryptResult<String> {
    bcrypt::hash(password, 10)
}

pub fn bcrypt_verify(password: &str, hash: &str) -> bcrypt::BcryptResult<bool> {
    bcrypt::verify(password, hash)
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

pub fn jwt_verify_token(token: &str, secret: &str) -> Result<JwtData, jwt::Error> {
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

    Ok(JwtData::new(username.unwrap().clone(), user_id.unwrap()))
}
