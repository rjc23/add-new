const sharp = require("sharp");
const fs = require('fs');

iterate = async () => {
  const outputfolder = 'states';
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

      // // find state entry
      // let stateEntry = whereTakenUSCurrent.find(
      //   (state) => state.code.toLowerCase() === code
      // );
      // let games = stateEntry.game;

      // if (!stateEntry) {
      //   console.log('No state entry found:', file);
      //   return; // Skip to the next file
      // }

      // Convert number to an integer
      // TODO: Update the following to number the files correctly based on the new import
      number = Number(number);
      if (number === 1) {
        number = 16;
      } else if (number === 2) {
        number = 17;
      } else if (number === 3) {
        number = 18;
      } else if (number === 4) {
        number = 19;
      } else if (number === 5) {
        number = 20;
      } else {
        console.log('Invalid file number:', file);
        return; // Skip to the next file
      }
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