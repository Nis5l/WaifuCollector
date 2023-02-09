use std::path::PathBuf;
use super::resize_image_to_ratio;

pub fn resize_image_square(path: PathBuf){
    resize_image_to_ratio(path, ".jpg", 500, 500);
}
