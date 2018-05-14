// Modules
const fs = require('fs');
const async = require('async');
const fetch = require('node-fetch');
const parseString = require('xml2js').parseString;
const delay = require('delay');

console.time('All data processed and saved');

// List of anime IDs from MAL list
let animeIds = [];

// API data to be saved
let data = {};

// MAL URLs
const apiUrl = 'https://myanimelist.net/malappinfo.php?u=fncombo&status=all&type=anime';
const jikanUrl = 'https://api.jikan.moe/anime/';

// Get MAL API XML
console.log('Getting MAL API XML');
fetch(apiUrl).then(res =>
    res.text()
).then(body => {
    parseString(body, {
        // This library's defaults are dumb
        explicitArray: false,
        charsAsChildren: true,
    }, (err, result) => {
        if (err) {
            throw err;
        }

        console.log('Parsing MAL API XML');

        // Process each anime
        result.myanimelist.anime.forEach(anime => {
            animeIds.push(parseInt(anime.series_animedb_id));
        });

        getApiData();
    });
});

const getApiData = () => {
    console.log('Getting API data');
    console.log('!!!WARNING!!! Limited to 2,000 requests per day, use cached version unless update is absolutely necessary')

    // Count how many requests done
    let done = 0;

    animeIds.forEach((id, i) => {
        // 5 second delay between each request
        delay(2500 * i).then(() => {
            console.log(`Getting info for anime ID ${id}, ${done + 1}/${animeIds.length}`);

            const getData = () => {
                fetch(`${jikanUrl}${id}`).then(res =>
                    res.json()
                ).then(body => {
                    if (body.hasOwnProperty('error')) {
                        console.log(`Retrying info for anime ID ${id}, failed:`, body.error);
                        getData();
                        return;
                    }

                    data[parseInt(id)] = body;

                    done++;

                    // When all done
                    if (done === animeIds.length) {
                        saveDataFile();
                    }
                });
            };

            getData();

        });
    });
};

// Save the JSON data file
const saveDataFile = () => {
    fs.writeFile('apidata.json', JSON.stringify(data), err => {
        if (err) {
            throw err;
        }

        console.timeEnd('All data processed and saved');
    })
};