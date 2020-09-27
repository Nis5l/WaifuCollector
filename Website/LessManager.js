
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

}

updateFiles();


