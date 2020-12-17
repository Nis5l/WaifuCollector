
var sass = require('node-sass');
const fs = require('fs');
var path = require('path');
var glob = require('glob');
const chokidar = require('chokidar');

const scssDir = 'resources/scss';
const cssDir = 'resources/css';

var getDirectories = function (src, callback) {
  glob(src + '/**/*', callback);
};

var watcher = chokidar.watch(scssDir, { persistent: true });

watcher.on('change', function(){

  updateFiles();

});

function updateFiles(){

  try{

    getDirectories(scssDir, function (err, files) {
      if (err) {
        console.error('Error', err);
      } else {
        
        files.forEach(element => {

          if(element.endsWith(".scss")){

            sass.render({file: element}, function(err, result){

                if(err){

                    console.log(err);

                }else{

                  if(result.css.toString().trim()){

                    fs.writeFile(cssDir + "/" + path.basename(element).replace("scss", "css"), result.css.toString(), function (err) {
                      
                      if (err) return console.error(err);
                      
                      //console.log("Updated " + element + "!");
        
                    });

                  }

                }

            });

          }

        });

      }
    });

  }catch (ex) {
    
  }

  setTimeout(combineCSSFiles, 1000);

}

function combineCSSFiles(){

 fs.open(cssDir + "/all.css", 'w', (err, file) => {

    if (err) {
        throw err;
    }

    fs.readFile("resources/css/_std.css", (err, data) => {
      if(err) {
          throw err;
      }

      fs.write(file, data.toString(), function(err){

        console.log("resources/css/_std.css");

        if (err) return console.error(err);

      });

    });

    getDirectories(cssDir, function (err, files) {

      if (err) {
  
        console.error('Error', err);
  
      } else {
  
        files.forEach(element => {

            if(element.endsWith(".css") && !element.endsWith("all.css") && !element.endsWith("_std.css")){
  
              fs.readFile(element, (err, data) => {
                if(err) {
                    throw err;
                }
  
                fs.write(file, data.toString(), function(err){
  
                  console.log(element);

                  if (err) return console.error(err);
  
                });
  
              });
  
            }
  
        });
  
      }
  
    });

  });

}

updateFiles();


