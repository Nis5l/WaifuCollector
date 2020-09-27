
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

  getDirectories(scssDir, function (err, files) {
    if (err) {
      console.log('Error', err);
    } else {
      
      files.forEach(element => {

        if(element.endsWith(".scss")){

          var result = sass.renderSync({file: element});

          fs.writeFile(cssDir + "/" + path.basename(element).replace("scss", "css"), result.css.toString(), function (err) {
            if (err) return console.log(err);
            
            console.log("Updated " + element + "!");

          });

        }

      });

    }
  });

}

updateFiles();


