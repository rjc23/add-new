const sharp = require("sharp");
const fs = require('fs');

iterate = async () => {
  const outputfolder = 'countries'; // change to states for wheretakenUS
  let nums = 0;
  fs.readdirSync('./imgs/').forEach((file) => {
    nums++;
    const codeArr = file.split(/-|_/);

    let code;
    let fileName;
    let number;

    if (codeArr.length === 2) {
      code = codeArr[0].toLowerCase();
      [fileName, number] = codeArr[1]
        .toLowerCase()
        .split(/(\d+)/)
        .filter(Boolean);

      // Convert number to an integer
      number = parseInt(number, 10);
    } else {
      console.log('Invalid file format:', file);
      return; // Skip to the next file
    }

    // Reconstruct fileName with the new number
    fileName = fileName + number;

    if (file !== '.DS_Store' && code) {
      sharp(`./imgs/${file}`)
        .resize(992, 720)
        .webp()
        .toBuffer()
        .then((data) => {
          fs.writeFile(
            `./${outputfolder}/${code}/${fileName}.webp`,
            data,
            (err) => {
              if (err) console.error('Error writing file:', err);
            }
          );
        })
        .catch((err) => {
          console.error('Error processing file:', file, err);
        });

      sharp(`./imgs/${file}`)
        .resize(992, 720)
        .jpeg()
        .toBuffer()
        .then((data) => {
          fs.writeFile(
            `./${outputfolder}/${code}/${fileName}.jpg`,
            data,
            (err) => {
              if (err) console.error('Error writing file:', err);
            }
          );
        })
        .catch((err) => {
          console.error('Error processing file:', file, err);
        });
    } else if (!code) {
      console.log('Code not found in file:', file);
    }
  });

  console.log(nums);
};

iterate();