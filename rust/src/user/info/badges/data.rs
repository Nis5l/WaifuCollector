use serde::Serialize;

#[derive(Serialize)]
pub struct Badge {
    pub name: &'static str,
    pub asset: &'static str
}

#[derive(Serialize)]
pub struct BadgesResponse {
    pub badges: Vec<Badge>
}
