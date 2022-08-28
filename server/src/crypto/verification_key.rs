use rand::{distributions::Alphanumeric, Rng};

pub fn generate_verification_key(length: usize) -> String {
    rand::thread_rng()
        .sample_iter(&Alphanumeric)
        .take(length)
        .map(char::from)
        .collect()
}
