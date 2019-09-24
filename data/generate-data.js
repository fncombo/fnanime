// Node
const { readdir, stat, readFile, writeFile } = require('fs').promises
const { promisify } = require('util')

// Libraries
const has = require('has')
const { eachSeries } = require('async')
const beautify = require('js-beautify')
const { green, magenta, red, yellow } = require('chalk')
const fetch = require('node-fetch')
const getFolderSize = promisify(require('get-folder-size'))
const git = require('simple-git/promise')
const { remove: removeDiacritics } = require('diacritics')
const singleLineLog = require('single-line-log').stdout

// Helpers
const { removeInvalidChars, getRewatchCount } = require('./helpers.js')
const { generateCache, updateCache, loadCache, saveCache } = require('./cache.js')

// Location of the file to save data to
const ANIME_JSON_LOCATION = '../src/js/data/data.json'

// MyAnimeList.net username
const MAL_USERNAME = 'fncombo'

// Location of all the anime
const ROOT_LOCATION = 'E:/Anime/'
const ANIME_FOLDERS = [
    `${ROOT_LOCATION}Series`,
    `${ROOT_LOCATION}OVA`,
    `${ROOT_LOCATION}Movies`,
    `${ROOT_LOCATION}Specials`,
    `${ROOT_LOCATION}Other`,
    `${ROOT_LOCATION}Ghibli Movies`,
]

// Type lookup
const TYPE_LOOKUP = {
    TV: 1,
    OVA: 2,
    Movie: 3,
    Special: 4,
    ONA: 5,
    Music: 6,
    Other: 7,
    Unknown: 8,
}

// Type to folder mapping
const TYPE_FOLDER_LOOKUP = {
    1: 'Series',
    2: 'OVA',
    3: 'Movies',
    4: 'Specials',
    5: 'Series',
    6: 'Other',
    7: 'Other',
    8: 'Other',
}

// Folders to ignore when checking against type
const IGNORED_FOLDERS = [
    'Ghibli Movies',
]

// Collected anime data from API and local files
const ALL_ANIME = {
    updated: Date.now(),
    anime: {},
}

// Detailed cached data about each anime
let CACHE

// Regular expression to match all the data tags in the anime file/folder name
const TAGS_REGEXP = /\[([\w\s,-]+)\]\[(\d{3,4})p\s(\w{2,3})\s(H\.\d{3})\s(\d{1,2})bit\s(\w{3,4})\]/

/**
 * Update anime data from the API.
 */
function processApiData(anime) {
    anime.forEach(cartoon => {
        // Remove diacritics and other unwanted characters from the title
        const title = removeDiacritics(cartoon.title).replace(/["]/g, '')

        // Create an array of all anime genre IDs for this anime

        // Start compiling clean data that we need
        ALL_ANIME.anime[removeInvalidChars(title)] = {
            id: cartoon.mal_id,
            title,
            type: TYPE_LOOKUP[cartoon.type],
            episodes: cartoon.total_episodes,
            episodesWatched: cartoon.watched_episodes,
            img: cartoon.image_url.match(/^[^?]+/)[0],
            status: cartoon.watching_status,
            airStatus: cartoon.airing_status,
            rating: cartoon.score,
            rewatchCount: getRewatchCount(cartoon.tags),
            url: cartoon.url,
            // The following data will be replaced if the anime is downloaded locally
            genres: [],
            subs: [],
            resolution: false,
            source: false,
            videoCodec: false,
            bits: false,
            audioCodec: false,
            size: 0,
        }
    })
}

/**
 * Save anime data from local folders and files.
 */
function processLocalData(filename, size, folder) {
    // Ignore rubbish
    if (/\.ini/.test(filename)) {
        return
    }

    // Get the anime title
    const [ title ] = filename.match(/.+(?=\s\[)/)

    // Check if this anime name exists in the API data first
    if (!has(ALL_ANIME.anime, title)) {
        throw new Error(`Local anime ${yellow(title)} was not found in API data`)
    }

    // Check if this anime is a duplicate if it already has a local size saved
    if (ALL_ANIME.anime[title].size > 0) {
        throw new Error(`Duplicate entry found for anime ${yellow(title)}`)
    }

    // Check that this anime is in the correct folder based on type
    const [ actualFolderName ] = folder.match(/[\s\w]+$/)
    const expectedFolderName = TYPE_FOLDER_LOOKUP[ALL_ANIME.anime[title].type]

    // Only check if the folder is not ignored
    if (!IGNORED_FOLDERS.includes(actualFolderName) && actualFolderName !== expectedFolderName) {
        throw new Error(`Expected anime ${yellow(title)} to be in folder ${
            yellow(expectedFolderName)}, but it's in ${
            yellow(actualFolderName)}`
        )
    }

    // Check to see if the filename has all the data tags
    if (!TAGS_REGEXP.test(filename)) {
        ALL_ANIME.anime[title] = {
            ...ALL_ANIME.anime[title],
            subs: null,
            resolution: null,
            source: null,
            videoCodec: null,
            bits: null,
            audioCodec: null,
            size,
        }

        return
    }

    // Get all data tags
    const [ , subs, resolution, source, videoCodec, bits, audioCodec ] = filename.match(TAGS_REGEXP)

    ALL_ANIME.anime[title] = {
        ...ALL_ANIME.anime[title],
        subs: subs.split(', '),
        resolution: parseInt(resolution, 10),
        source,
        videoCodec,
        bits: parseInt(bits, 10),
        audioCodec,
        size,
    }
}

/**
 * Process all anime from the API by adding data from the cache to them.
 */
function processCacheData() {
    for (const title of Object.keys(ALL_ANIME.anime)) {
        const anime = ALL_ANIME.anime[title]
        const cachedAnime = CACHE.anime[anime.id]

        // eslint-disable-next-line camelcase
        anime.genres = cachedAnime.genres.filter(({ type }) => type === 'anime').map(({ mal_id }) => mal_id)

        anime.studios = cachedAnime.studios.map(({ name }) => name)
    }
}

/**
 * Get anime list API data.
 */
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
        response = await fetch(`https://api.jikan.moe/v3/user/${MAL_USERNAME}/animelist/all/${page}`)
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

/**
 * Monolith incoming.
 */
getApiData().then(async () => {
    // Generate new cache if the argument has been passed, then save it
    if (process.argv.includes('cache')) {
        CACHE = await generateCache()

        await saveCache(CACHE)

    // Load existing cache
    } else {
        CACHE = await loadCache()

        // Attempt to update cache with any missing anime
        const animeIds = []

        for (const { id } of Object.values(ALL_ANIME.anime)) {
            animeIds.push(id)
        }

        await updateCache(CACHE, animeIds)

        await saveCache(CACHE, true)
    }

    processCacheData()

    // Go through each main anime folder
    await eachSeries(ANIME_FOLDERS, async animeFolder => {
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
            processLocalData(name, totalSize, animeFolder)
        })

        // Empty log to separate single line logs between anime folders
        if (contents.length) {
            console.log()
        }
    })

    // Get the current anime data to compare if it has been updated
    let currentAnimeData

    try {
        currentAnimeData = await readFile(ANIME_JSON_LOCATION, 'utf8')

        currentAnimeData = JSON.parse(currentAnimeData)

        currentAnimeData = JSON.stringify(currentAnimeData.anime)

        if (currentAnimeData === JSON.stringify(ALL_ANIME.anime)) {
            console.log(green('Anime data JSON is already up-to-date!'))

            return
        }
    } catch (error) {
        console.log(magenta('Could not read existing anime data JSON to compare changes'))
    }

    // Save all anime data
    try {
        await writeFile(ANIME_JSON_LOCATION, beautify(JSON.stringify(ALL_ANIME)))
    } catch (error) {
        throw new Error('Could not save anime data JSON')
    }

    console.log('Anime data saved as JSON')

    // Do not commit if the "commit" argument was not passed
    if (!process.argv.includes('commit')) {
        console.log(green('All done, have fun!'))

        return
    }

    // Commit and push data if the "commit" argument was passed
    console.log('Committing data to repository')

    await git().commit('Anime data JSON update', ANIME_JSON_LOCATION)

    console.log('Pushing master to origin')

    await git().push('origin', 'master')

    console.log(green('All done, have fun!'))
}).catch(error => {
    // Catch and log any errors
    console.log('\n')

    console.log(red(error))
})
