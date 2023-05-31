use std::path::PathBuf;
use super::resize_image_to_ratio;

pub fn resize_image_card(path: PathBuf){
    resize_image_to_ratio(path, ".jpg", 330, 516);
}
