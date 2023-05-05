const fs = require('fs');
const path = require('path');
const { stdout, stdin } = process;

const output = fs.createWriteStream(path.join(__dirname, 'result.txt'));

stdout.write('Hello, enter something:\n');
stdin.on('data', data => {
  if (data.toString().slice(0, -1) === 'exit') {
    process.exit();
  } else {
    output.write(data.toString());
  }
});

process.on('SIGINT', () => process.exit());
process.on('exit', () => stdout.write('\nGoodbye, good luck!'));
