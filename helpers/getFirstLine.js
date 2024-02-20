import fs from 'fs';
import readline from 'readline';

export default async function getFirstLine(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error('File not found!');
    }

    const readStream = fs.createReadStream(filePath);
    const reader = readline.createInterface({ input: readStream });

    const line = await new Promise(resolve => {
      reader.on('line', line => {
        reader.close();
        resolve(line);
      });
    });
    readStream.close();
    return line;
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
};
