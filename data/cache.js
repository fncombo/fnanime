// Node
const { readFile, writeFile } = require('fs').promises

// Libraries
const has = require('has')
const { eachSeries } = require('async')
const beautify = require('js-beautify')
const { magenta, yellow } = require('chalk')
const fetch = require('node-fetch')

// Cache location
const CACHE_LOCATION = 'cache.json'

/**
 * Get detailed data (for use in cache) about a single anime.
 */
async function getAnimeData(animeId, tryCount = 1) {
    // Stop after too many retries
    if (tryCount > 6) {
        throw new Error('Too many API retries')
    }

    console.log(tryCount > 1 ? 'Retrying' : 'Getting', 'data for anime ID:', yellow(animeId))

    // Wait at least 4 seconds between API requests, increasing with each retry, and 4 seconds on initial
    await new Promise(resolve => {
        setTimeout(resolve, tryCount * 4000)
    })

    // Get the data
    let response

    try {
        response = await fetch(`https://api.jikan.moe/v3/anime/${animeId}`)
    } catch (error) {
        console.log(magenta('Error occurred while fetching API, retrying'))

        return getAnimeData(animeId, tryCount + 1)
    }

    // Re-try if failed for any reason
    if (response.status !== 200) {
        console.log(magenta('API responded with non-200 status, retrying'))

        return getAnimeData(animeId, tryCount + 1)
    }

    // Parse JSON response
    const data = await response.json()

    // Return anime data
    return data
}

/**
 * Generate cache data for all given anime IDs.
 */
async function generateCache(animeIds) {
    console.log('Generating new cache, this will take a while')

    // Create a new blank object
    const cache = {
        updated: Date.now(),
        anime: {},
    }

    // Go through each anime ID and generate cache for it one at a time
    await eachSeries(animeIds, async animeId => {
        const data = await getAnimeData(animeId)

        cache.anime[animeId] = data
    })

    return cache
}

/**
 * Updates provided current cache with anime IDs which are not present in it.
 */
async function updateCache(cache, animeIds) {
    // Filter to get only anime IDs which aren't already present in the cache
    const newAnimeIds = animeIds.filter(animeId => !has(cache.anime, animeId))

    if (!newAnimeIds.length) {
        return false
    }

    // Go through each new anime ID and generate cache for it one at a time
    await eachSeries(newAnimeIds, async newAnimeId => {
        // eslint-disable-next-line no-param-reassign
        cache.anime[newAnimeId] = await getAnimeData(newAnimeId)
    })

    return true
}

/**
 * Attempt to load cache data from a file, or re-generate it if failed to load.
 */
async function loadCache() {
    let cache

    try {
        cache = await readFile(CACHE_LOCATION, 'utf8')

        cache = JSON.parse(cache)

        // Check if the cache is too old
        if (Date.now() - cache.updated > 2.628e9) {
            console.log('Cache is over a month old, consider deleting it so that it\'s generated again')
        } else {
            console.log('Successfully loaded cache')
        }

    // Generate new cache if it wasn't found
    } catch (error) {
        console.log(magenta('No cache found'))

        return generateCache()
    }

    return cache
}

/**
 * Save cache data to file.
 */
async function saveCache(data, isUpdate = false) {
    const saveData = beautify(JSON.stringify(data))

    try {
        await writeFile(CACHE_LOCATION, saveData)
    } catch (error) {
        throw new Error('Could not save cache')
    }

    console.log(isUpdate ? 'Cache updated' : 'Cache saved')

    return true
}

// Exports
module.exports = {
    getAnimeData,
    updateCache,
    loadCache,
    saveCache,
}
