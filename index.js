const express = require("express");
const dayjs = require('dayjs');
const newWhereTakenUS = require('./wheretakenUSNew');
const newWhereTakenUSFacts = require('./wheretakenUSNewFacts');
const whereTakenUSCurrent = require('./whereTakenUSCurrent');
const months = require('./whereTakenUSutils/months');
const states = require('./whereTakenUSutils/states');
const whereTakenUSPerms = require('./whereTakenUSPerms');
const app = express();
const PORT = 3006;

app.listen(PORT, (error) => {
  if (!error)
    console.log(
      'Server is Successfully Running, and App is listening on port ' + PORT
    );
  else console.log("Error occurred, server can't start", error);
});

app.get('/wheretakenUSNew', async function (req, res, next) {
  newWhereTakenUS.forEach((entry) => {
    // Find the corresponding state in the whereTakenUSCurrent array
    const stateEntry = whereTakenUSCurrent.find(
      (state) => state.code === entry.code
    );

    // If state is not found in the whereTakenUSCurrent array, skip this iteration
    if (!stateEntry) {
      console.log("didn't find state: ", entry.code);
      return;
    }

    const newFacts = newWhereTakenUSFacts.find(
      (facts) => facts.code === stateEntry.code
    );
    // If state is not found in the whereTakenUSNewFacts array, skip this iteration
    if (!newFacts) {
      console.log("didn't find facts: ", stateEntry.name.toLowerCase());
      return;
    }

    // Find the next game number for this state
    let nextGameNumber = stateEntry.game.length + 1;

    // Construct the new game entry using the data from newWhereTakenUS
    let newGameEntry = {
      number: nextGameNumber,
      mainImage: {
        name: entry.mainImgLocation,
        photographer: '',
        imageLink: entry.mainImageLink,
        wikiLink: entry.mainImageWiki,
      },
      landmark: {
        name: entry.landmarkLocation,
        photographer: '',
        imageLink: entry.landmarkImageLink,
        wikiLink: entry.landmarkImageWiki,
        hasLandmark: true,
      },
      city: {
        name: entry.cityImageLocation.trim(),
        photographer: '',
        imageLink: entry.cityImageLink,
        wikiLink: entry.cityImageWiki,
      },
      landmarksRound: [], // updated farther down
      landmarkPlaces: [], // updated farther down
      weatherMonth: months[Math.floor(Math.random() * months.length)], // choose a random month for weather
      nicknameOptions: stateEntry.game[nextGameNumber - 5].nicknameOptions,
      flowerOptions: stateEntry.game[nextGameNumber - 5].flowerOptions,
      facts: getFact(nextGameNumber, newFacts),
      uniqueId: makeid(8),
    };

    // Ensure the city from the new game exists in the states's cities array
    if (!stateEntry.cities.includes(entry.cityImageLocation.trim())) {
      stateEntry.cities.push(entry.cityImageLocation.trim());
    }

    // Integration of logic from the first code
    let potential = [];
    let potentialNames = [];

    newWhereTakenUS.forEach((p) => {
      if (entry.code !== p.code) {
        const permState = whereTakenUSCurrent.find((v) => v.code === p.code);
        if (permState) {
          permState.game.forEach((game) => {
            if (game.landmark.hasLandmark) {
              potential.push({
                code: permState.code,
                number: game.number,
              });
              potentialNames.push(game.landmark.name);
            }
          });
        }
      }
    });

    let codesToAdd = [];
    for (var i = 2; i >= 0; i--) {
      let removed = potential.splice(
        Math.floor(Math.random() * potential.length),
        1
      );
      if (!removed) {
        removed = {
          code: 'AK',
          number: 1,
        };
      }
      codesToAdd = [...codesToAdd, removed[0]];
    }

    let namesToAdd = [];
    for (var i = 6; i >= 0; i--) {
      let removed = potentialNames.splice(
        Math.floor(Math.random() * potentialNames.length),
        1
      );
      if (!removed || removed === null) {
        removed = '';
      }
      namesToAdd = [...namesToAdd, removed[0]];
    }

    newGameEntry.landmarksRound = [...codesToAdd];
    newGameEntry.landmarkPlaces = [...namesToAdd];

    // Push the new game entry to the state's game array
    stateEntry.game.push(newGameEntry);
  });

  res.send(whereTakenUSCurrent);
});

app.get('/wheretakenUSPerms', async function (req, res, next) {
  const newPhotoCodes = [16, 17, 18, 19, 20]; //TODO: edit these as needed

  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  };

  const distributeStates = (states, codes) => {
    const entries = [];
    states.forEach((state) => {
      codes.forEach((code) => {
        entries.push({ state, photoCode: code });
      });
    });
    shuffleArray(entries);

    // This could be optimized to ensure the spacing between states
    const spacedEntries = [];
    entries.forEach((entry) => {
      // Try to find an optimal place in spacedEntries
      let placed = false;
      for (let i = 0; !placed && i < spacedEntries.length; i += 53) {
        if (
          !spacedEntries
            .slice(Math.max(0, i - 5), i)
            .some((e) => e.state === entry.state)
        ) {
          spacedEntries.splice(i, 0, entry);
          placed = true;
        }
      }
      if (!placed) spacedEntries.push(entry);
    });

    return spacedEntries;
  };

  const lastEntry = whereTakenUSPerms[whereTakenUSPerms.length - 1];
  let lastNumber = lastEntry.number;
  const [day, month, year] = lastEntry.date.split('/').map(Number);
  let currentDate = dayjs(new Date(year, month - 1, day));

  const extendedEntries = distributeStates(states, newPhotoCodes).map(
    (entry) => {
      lastNumber++;
      currentDate = currentDate.add(1, 'day');
      return {
        ...entry,
        date: currentDate.format('D/M/YYYY'),
        number: lastNumber,
      };
    }
  );

  whereTakenUSPerms.push(...extendedEntries);

  res.status(200).send(whereTakenUSPerms);
});

// TODO: update this as needed to read sheet data correctly
function getFact(gameNumber, facts) {
  switch (gameNumber) {
    case 16: {
      return {
        trueFalse: true,
        trueFact: facts.true1,
        falseFact: facts.false1,
        fillQuestion: '',
        fillAnswer: '',
        fillAnswers: [],
      };
    }
    case 17: {
      return {
        trueFalse: false,
        trueFact: '',
        falseFact: '',
        fillQuestion: facts.fill1,
        fillAnswer: facts.fill1Answer,
        fillAnswers: [facts.fill1A, facts.fill1B, facts.fill1C, facts.fill1D],
      };
    }
    case 18: {
      return {
        trueFalse: true,
        trueFact: facts.true2,
        falseFact: facts.false2,
        fillQuestion: '',
        fillAnswer: '',
        fillAnswers: [],
      };
    }
    case 19: {
      return {
        trueFalse: true,
        trueFact: facts.true3,
        falseFact: facts.false3,
        fillQuestion: '',
        fillAnswer: '',
        fillAnswers: [],
      };
    }
    case 20: {
      return {
        trueFalse: false,
        trueFact: '',
        falseFact: '',
        fillQuestion: facts.fill2,
        fillAnswer: facts.fill2Answer,
        fillAnswers: [facts.fill2A, facts.fill2B, facts.fill2C, facts.fill2D],
      };
    }
    default: {
      throw new Error('hit default addFact');
    }
  }
}

function makeid(length) {
    let result = '';
    const characters = 'BCDFGHJKLMNPQRSTVWXYZbcdfghjklmnpqrstvwxyz23456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
}