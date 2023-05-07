const fs = require('fs');
const path = require('path');

const projectFolder = path.join(__dirname, 'project-dist');
const assetsFolder = path.join(__dirname, 'assets');
const projectAssetsFolder = path.join(projectFolder, 'assets');
const templateHtml = path.join(__dirname, 'template.html');
const componentsHtml = path.join(__dirname, 'components');
const indexHtmlFile = path.join(projectFolder, 'index.html');
const bundleCss = path.join(projectFolder, 'style.css');
const stylesFolder = path.join(__dirname, 'styles');

async function createFolder(folder) {
  await fs.promises.mkdir(folder)
    .then(function () { })
    .catch(function () { });
}

async function clearAssetsFiles(newFolder) {
  fs.readdir(newFolder, { withFileTypes: true }, (error, files) => {
    if (error) throw error;

    files.forEach(file => {
      const newFile = path.join(newFolder, file.name);
      const fileInfo = path.parse(newFile);

      if (file.isDirectory()) {
        clearAssetsFiles(newFile);
      }

      if (file.isFile() && fileInfo.ext !== '.html' && fileInfo.ext !== '.css') {
        fs.unlink(path.join(newFolder, file.name), error => {
          if (error) throw error;
        });
      }
    });
  });

  await copyAssetsFiles(assetsFolder, projectAssetsFolder);
}

async function copyAssetsFiles(oldFolder, newFolder) {
  fs.readdir(oldFolder, { withFileTypes: true }, (error, files) => {
    if (error) throw error;

    files.forEach(file => {
      const oldFile = path.join(oldFolder, file.name);
      const newFile = path.join(newFolder, file.name);

      if (file.isDirectory()) {
        fs.mkdir(newFile, { recursive: true }, error => {
          if (error) throw error;
        });

        copyAssetsFiles(oldFile, newFile);
      }

      if (file.isFile()) {
        fs.copyFile(oldFile, newFile, error => {
          if (error) throw error;
        });
      }
    });
  });
}

async function createIndexHtml() {
  const tempStream = fs.createReadStream(templateHtml, 'utf8');
  let indexHtml = '';

  tempStream.on('data', chunk => {
    indexHtml = indexHtml + chunk;
  });

  fs.readdir(componentsHtml, { withFileTypes: true }, (error, files) => {
    if (error) throw error;

    files.forEach(file => {
      const currentComponent = path.join(componentsHtml, file.name);
      const fileInfo = path.parse(currentComponent);

      if (file.isFile() && fileInfo.ext === '.html') {
        const componentStream = fs.createReadStream(currentComponent, 'utf-8');

        componentStream.on('data', chunk => {
          const position = indexHtml.indexOf(fileInfo.name);

          if (position !== -1) {
            const startPosition = indexHtml.slice(0, position - 2);
            const endPosition = indexHtml.slice(position + 2 + fileInfo.name.length);

            indexHtml = `${startPosition}\n${chunk}\n${endPosition}`;
          }
        });

        componentStream.on('end', () => {
          fs.writeFile(indexHtmlFile, indexHtml, error => {
            if (error) throw error;
          });
        });
      }
    });
  });
}

async function createStyles() {
  fs.promises.readdir(stylesFolder)
    .then(files => {
      fs.access(bundleCss, fs.F_OK, error => {
        if (error) return;

        fs.truncate(bundleCss, error => {
          if (error) throw error;
        });
      });

      files.forEach(file => {
        fs.stat(path.join(stylesFolder, file), (error, stat) => {
          if (error) throw error;

          const currentStyle = path.join(stylesFolder, file);
          const styleInfo = path.parse(currentStyle);

          if (stat.isFile() && styleInfo.ext === '.css') {
            fs.readFile(path.join(stylesFolder, file), 'utf8', (error, styleContent) => {
              if (error) throw error;

              fs.appendFile(bundleCss, styleContent + '\n', error => {
                if (error) throw error;
              });
            });
          }
        });
      });
    })
    .catch(error => {
      if (error) throw error;
    });
}

async function init() {
  await createFolder(projectFolder);
  await createFolder(projectAssetsFolder);
  await clearAssetsFiles(projectFolder);
  await createIndexHtml();
  await createStyles();
}

init();
