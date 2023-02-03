use pyo3::prelude::*;
use pyo3::types::PyTuple;
use std::path::PathBuf;

pub fn resize_image_square(path: PathBuf){
    let script = include_str!("resize_image_square.py");

    let path_string = match path.to_str() {
        Some(string) => string,
        None => return
    };
    println!("Calling resize_image_square.py ...");
    let result = Python::with_gil(|py| -> PyResult<Py<PyAny>> {
        let app: Py<PyAny> = PyModule::from_code(py, script, "", "")?.getattr("resize")?.into();
        let args = PyTuple::new(py, &[path_string]);
        app.call1(py, args)
    });

    match result {
        Err(_) => println!("An error occured while executing the script"),
        Ok(_) => println!("Called resize_image_square.py!")
    }
}
