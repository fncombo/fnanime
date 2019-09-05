// Node
const { readdir, stat, readFile, writeFile } = require('fs').promises
const { promisify } = require('util')

// Libraries
const { eachSeries } = require('async')
const beautify = require('js-beautify')
const { green, magenta, red, yellow } = require('chalk')
const fetch = require('node-fetch')
const getFolderSize = promisify(require('get-folder-size'))
const git = require('simple-git/promise')
const { remove: removeDiacritics } = require('diacritics')
const singleLineLog = require('single-line-log').stdout

// Parameters
const animeJsonLocation = '../src/js/data/Anime.json'
const saveTimeJsonLocation = '../src/js/data/LocalDataUpdated.json'
const malUsername = 'fncombo'
const animeFolders = [
    'E:/Anime/Series',
    'E:/Anime/Movies',
    'E:/Anime/Ghibli Movies',
    'E:/Anime/Special and OVA',
]

// Type lookup
const typeLookup = {
    TV: 1,
    OVA: 2,
    Movie: 3,
    Special: 4,
    ONA: 5,
    Music: 6,
    Other: 7,
    Unknown: 8,
}

// Collected anime data from API and local files
const allAnime = new Map()

// Regular expression to match all the data tags in the anime file/folder name
const tagsRegexp = RegExp(/\[([\w\s-]+)\]\[(\d{3,4})p\s(\w{2,3})\s(H\.\d{3})\s(\d{1,2})bit\s(\w{3,4})\]/)

// Replace or remove characters that cannot be used in folder and file names
function removeInvalidChars(string) {
    return string.replace(/[√:?]/g, '').replace(/[★/]/g, ' ')
}

// Get the rewatch count from the anime's tags
function getRewatchCount(tags) {
    if (!tags) {
        return 0
    }

    const match = tags.match(/re-watched:\s(\d+)/i)

    return match ? parseInt(match[1], 10) : 0
}

// Save data from API
function processApiData(anime) {
    anime.forEach(cartoon => {
        // Remove diacritics and other unwanted characters from the title
        const title = removeDiacritics(cartoon.title).replace(/["]/g, '')

        // Start compiling clean data that we need
        allAnime.set(removeInvalidChars(title), {
            id: cartoon.mal_id,
            title,
            type: typeLookup[cartoon.type],
            episodes: cartoon.total_episodes > 0 ? cartoon.total_episodes : null,
            episodesWatched: cartoon.watched_episodes,
            img: cartoon.image_url.match(/^[^?]+/)[0],
            status: cartoon.watching_status,
            rating: cartoon.score,
            rewatchCount: getRewatchCount(cartoon.tags),
            url: cartoon.url,
            // The following data will be replaced if the anime is downloaded locally
            subs: false,
            resolution: false,
            source: false,
            videoCodec: false,
            bits: false,
            audioCodec: false,
            size: false,
        })
    })
}

// Save data from local folders and files
function processLocalData(filename, size) {
    // Ignore rubbish
    if (/\.ini/.test(filename)) {
        return
    }

    // Get the anime title
    const [ title ] = filename.match(/.+(?=\s\[)/)

    // Check if this anime name exists in the API data first
    if (!allAnime.has(title)) {
        throw new Error(`Local anime ${yellow(title)} was not found in API data`)
    }

    // Check if this anime is a duplicate if it already has a local size saved
    if (allAnime.get(title).size > 0) {
        throw new Error(`Duplicate entry found for anime ${yellow(title)}`)
    }

    // Check to see if the filename has all the data tags
    if (!tagsRegexp.test(filename)) {
        allAnime.set(title, {
            ...allAnime.get(title),
            subs: null,
            resolution: null,
            source: null,
            videoCodec: null,
            bits: null,
            audioCodec: null,
            size,
        })

        return
    }

    // Get all data tags
    const [ , subs, resolution, source, videoCodec, bits, audioCodec ] = filename.match(tagsRegexp)

    allAnime.set(title, {
        ...allAnime.get(title),
        subs,
        resolution: parseInt(resolution, 10),
        source,
        videoCodec,
        bits,
        audioCodec,
        size,
    })
}

// Get my anime list API data
async function getApiData(page = 1, isRetry = false) {
    // Stop after too many retries
    if (isRetry > 5) {
        throw new Error('Too many API retries')
    }

    console.log(isRetry ? 'Retrying' : 'Getting', 'page', yellow(page), 'of API')

    // Wait at least 2 seconds between API requests, increasing with each retry
    if (page > 1 || isRetry) {
        await new Promise(resolve => {
            setTimeout(resolve, (isRetry || 1) * 2000)
        })
    }

    // Get the data
    let response

    try {
        response = await fetch(`https://api.jikan.moe/v3/user/${malUsername}/animelist/all/${page}`)
    } catch (error) {
        console.log(magenta('Error occurred while fetching API, retrying'))

        return getApiData(page, isRetry ? isRetry + 1 : 1)
    }

    // Re-try if failed for any reason
    if (response.status !== 200) {
        console.log(magenta('API responded with non-200 status, retrying'))

        return getApiData(page, isRetry ? isRetry + 1 : 1)
    }

    // Parse JSON response
    const { anime } = await response.json()

    // Process the API data
    processApiData(anime)

    // If this page was full (300 entries per page), get the next page
    if (anime.length === 300) {
        return getApiData(page + 1)
    }

    return true
}

getApiData().then(async () => {
    // Go through each anime folder
    await eachSeries(animeFolders, async animeFolder => {
        // Read this folder's contents
        let contents

        try {
            contents = await readdir(animeFolder, { withFileTypes: true })
        } catch (error) {
            throw new Error(`Could not read folder: ${yellow(animeFolder)}`)
        }

        // Go through each folder/file within this anime folder
        await eachSeries(contents, async subContent => {
            const { name } = subContent
            const index = contents.indexOf(subContent) + 1
            let totalSize

            singleLineLog(
                'Getting the total size of',
                yellow(index), '/', yellow(contents.length),
                'sub-folders/files from:',
                yellow(animeFolder)
            )

            // If this is a folder, get its total size recursively based on all the files inside
            if (subContent.isDirectory()) {
                try {
                    totalSize = await getFolderSize(`${animeFolder}/${name}`)
                } catch (error) {
                    throw new Error(`Could not get total size of folder: ${animeFolder}/${name}`)
                }
            } else {
                try {
                    const stats = await stat(`${animeFolder}/${name}`)

                    totalSize = stats.size
                } catch (error) {
                    throw new Error(`Could not get stats of file: ${animeFolder}/${name}`)
                }
            }

            // Save data about this local anime
            processLocalData(name, totalSize)
        })

        // Empty log to separate single line logs between anime folders
        console.log()
    })

    // Convert anime map to a plain object for saving
    const allAnimeObject = {}

    for (const [ , animeData ] of allAnime) {
        allAnimeObject[animeData.id] = animeData
    }

    // Get the current anime data to compare if it has been updated
    let currentAnimeData

    try {
        currentAnimeData = await readFile(animeJsonLocation, 'utf8')
    } catch (error) {
        console.log(yellow('Could not read existing anime data JSON to compare changes'))
    }

    const allAnimeData = beautify(JSON.stringify(allAnimeObject))

    if (currentAnimeData === allAnimeData) {
        console.log(green('Anime data JSON is already up-to-date!'))

        return
    }

    const saveTimeData = beautify(JSON.stringify({ updated: Date.now() }))

    // Save all anime data
    try {
        await writeFile(animeJsonLocation, allAnimeData)
    } catch (error) {
        throw new Error('Could not save anime data JSON')
    }

    console.log('Anime data saved as JSON')

    // Save the time this script was last run
    try {
        await writeFile(saveTimeJsonLocation, saveTimeData)
    } catch (error) {
        throw new Error('Could not save last save time JSON')
    }

    console.log('Last save time data saved as JSON')

    // Do not commit if the "commit" argument was not passed
    if (process.argv.length !== 3 || process.argv[2] !== 'commit') {
        console.log(green('All done, have fun!'))

        return
    }

    // Commit and push data if the "commit" argument was passed
    console.log(magenta('Committing data to repository'))

    await git().commit('Anime data JSON update', [
        animeJsonLocation,
        saveTimeJsonLocation,
    ])

    console.log(magenta('Pushing master to origin'))

    await git().push('origin', 'master')

    console.log(green('All done, have fun!'))
}).catch(error => {
    // Catch and log any errors
    console.log('\n')

    console.log(red(error))
})
