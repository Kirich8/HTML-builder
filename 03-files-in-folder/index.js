const fs = require('fs');
const path = require('path');

const folder = path.join(__dirname, 'secret-folder');

fs.promises.readdir(folder)
  .then(files => {
    files.forEach(file => {
      fs.stat(path.join(__dirname, 'secret-folder', file), (err, stats) => {
        if (err) console.log(err);
        if (stats.isFile()) console.log(`${file.split('.')[0]} - ${file.split('.')[1]} - ${stats.size}b`);
      });
    });
  })
  .catch(err => {
    console.log(err);
  });