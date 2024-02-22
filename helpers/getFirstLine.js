import fs from 'fs';
import readline from 'readline';

export default async function getFirstLine(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error('File not found!');
    }

    const readStream = fs.createReadStream(filePath, 'utf-8');
    const reader = readline.createInterface({ input: readStream, output: process.stdout, terminal: false });

    let lineCount = 0;

    const line = await new Promise(resolve => {
      reader.on('close', () => {
        if (lineCount === 0) {
          resolve('');
        }
      });
      reader.on('line', res => {
        lineCount++;
        reader.close();
        resolve(res);
      });
    });
    readStream.close();
    return line;
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
};
