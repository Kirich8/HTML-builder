const fs = require('fs');
const path = require('path');

const oldFolder = path.join(__dirname, 'files');
const newFolder = path.join(__dirname, 'files-copy');

async function copyFolder() {
  await fs.promises.mkdir(newFolder)
    .then(function () {})
    .catch(function () {});

  await fs.promises.readdir(newFolder)
    .then(files => {
      files.forEach(file => {
        fs.unlink(path.join(newFolder, file), (err) => {
          if (err) throw err;
        });
      });
    })
    .catch(err => {
      console.log(err);
    });

  fs.readdir(oldFolder, (err, files) => {
    if (err) throw err;
    files.forEach(file => {
      fs.copyFile(path.join(oldFolder, file), path.join(newFolder, file), (err) => {
        if (err) throw err;
      });
    });
  });
}

copyFolder();