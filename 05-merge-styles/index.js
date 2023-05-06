const fs = require('fs');
const path = require('path');

const stylesFolder = path.join(__dirname, 'styles');
const projectFolder = path.join(__dirname, 'project-dist');
const bundleCss = path.join(projectFolder, 'bundle.css');

fs.promises.readdir(stylesFolder)
  .then(files => {
    fs.access(bundleCss, fs.F_OK, (err) => {
      if (err) return;

      fs.truncate(bundleCss, (err) => {
        if (err) throw err;
      });
    });

    files.forEach(file => {
      fs.stat(path.join(stylesFolder, file), (err, stats) => {
        if (err) console.log(err);

        if (stats.isFile() && file.split('.')[1] === 'css') {
          fs.readFile(path.join(stylesFolder, file), 'utf8', (error, fileContent) => {
            if (error) throw error;

            fs.appendFile(bundleCss, fileContent + '\n', (error) => {
              if (error) throw error;
            });
          });
        }
      });
    });
  })
  .catch(err => {
    console.log(err);
  });