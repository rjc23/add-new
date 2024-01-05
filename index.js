const express = require("express");
const newWhereTaken = require("./wheretakenNew");
const whereTakenCurrent = require("./whereTakenCurrent");
const app = express();
const PORT = 3006;

app.listen(PORT, (error) => {
    if (!error)
        console.log(
            "Server is Successfully Running, and App is listening on port " + PORT
        );
    else console.log("Error occurred, server can't start", error);
});

app.get("/wheretakenNew", async function (req, res, next) {
    newWhereTaken.forEach(entry => {

        // Find the corresponding country in the whereTakenCurrent array
        let countryEntry = whereTakenCurrent.find(country => country.name === entry.country);

        // If country is not found in the whereTakenCurrent array, skip this iteration
        if (!countryEntry) return;


        // Find the next game number for this country
        let nextGameNumber = countryEntry.game.length + 1;

        // Construct the new game entry using the data from newWhereTaken
        let newGameEntry = {
            number: nextGameNumber,
            mainImage: {
                name: entry.mainImageLocation,
                photographer: "",
                imageLink: entry.mainImageLink,
                wikiLink: entry.mainImageWiki
            },
            landmark: {
                name: entry.landmarkImageName,
                photographer: "",
                imageLink: entry.landmarkImageLink,
                wikiLink: entry.landmarkImageWiki,
                hasLandmark: true  // Assuming all landmarks have a 'hasLandmark' value of true
            },
            city: {
                name: entry.cityImageName,
                photographer: "",
                imageLink: entry.cityImageLink,
                wikiLink: entry.cityImageWiki
            },
            landmarksRound: [],  // This can be updated later if needed
            landmarkPlaces: [],  // This can be updated later if needed
            uniqueId: makeid(8),  // This can be updated later if needed
            hasMapAndCityRound: entry.cityImageName && entry.cityImageLink ? true : false  // Assuming all entries have a 'hasMapAndCityRound' value of true
        };

                // Ensure the city from the new game exists in the country's cities array
                if (!countryEntry.cities.includes(entry.cityImageName)) {
                    countryEntry.cities.push(entry.cityImageName);
                }
        
                // If there are more than six cities, remove the first city not present in any game
                if (countryEntry.cities.length > 6) {
                    let citiesInGames = new Set(countryEntry.game.map(g => g.city.name));
                    let cityToRemove = countryEntry.cities.find(city => !citiesInGames.has(city));
        
                    if (cityToRemove) {
                        countryEntry.cities = countryEntry.cities.filter(city => city !== cityToRemove);
                    }
                    // Additional logic may be necessary if no city can be removed
                }

        // Integration of logic from the first code
        let potential = [];
        let potentialNames = [];

        newWhereTaken.forEach(p => {
            if (entry.country !== p.country) {
                const permState = whereTakenCurrent.find(v => v.name === p.country);
                if (permState) {
                    permState.game.forEach(game => {
                        if (game.landmark.hasLandmark) {
                            potential.push({
                                code: permState.code,
                                number: game.number
                            });
                            potentialNames.push(game.landmark.name);
                        }
                    });
                }
            }
        });

        let codesToAdd = []
        for (var i = 2; i >= 0; i--) {
            let removed = potential.splice(Math.floor(Math.random() * potential.length), 1);
            if (!removed) {
                removed = {
                    code: "AK",
                    number: 1
                };
            }
            codesToAdd = [...codesToAdd, removed[0]];
        }

        let namesToAdd = []
        for (var i = 6; i >= 0; i--) {
            let removed = potentialNames.splice(Math.floor(Math.random() * potentialNames.length), 1);
            if (!removed || removed === null) {
                removed = ""
            }
            namesToAdd = [...namesToAdd, removed[0]];
        }

        newGameEntry.landmarksRound = [...codesToAdd];
        newGameEntry.landmarkPlaces = [...namesToAdd];

        // Push the new game entry to the country's game array
        countryEntry.game.push(newGameEntry);
    });

    res.send(whereTakenCurrent);
});

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