// Data
import { ACTIONS } from '../data/GlobalState'

// Object to cache API data to avoid fetching the same thing multiple times
const cachedApiData = {}

/**
 * Attempt to retrieve a deeply nested property from an object. Returns the value if found or false.
 */
function getNestedProperty(object, property, ...rest) {
    if (object === undefined) {
        return false
    }

    if (rest.length === 0 && object.hasOwnProperty(property)) {
        return object[property]
    }

    return getNestedProperty(object[property], ...rest)
}

/**
 * Replaces special characters returned by the API into proper HTML entities.
 */
function replaceSpecialChars(string) {
    return string.replace(/&#(\d+);/g, (match, p1) => String.fromCharCode(p1))
}

/**
 * Convert duration returned by the API into just minutes.
 */
function convertDuration(duration) {
    // Convert hours into minutes
    if (/hr/i.test(duration)) {
        const match = duration.match(/(\d+)\s?hr\.?\s?(\d+)?/i)

        return (parseInt(match[1], 10) * 60) + (match[2] ? parseInt(match[2], 10) : 0)
    }

    return parseInt(duration, 10)
}

/**
 * Get the previous or next anime in the current table.
 */
function getAdjacentAnime(allAnime, animeId, direction) {
    const index = allAnime.findIndex(anime => anime.id === animeId)

    // Anime is not in table, so can't show next/prev in relation to it
    if (index === -1) {
        return false
    }

    switch (direction) {
    case ACTIONS.NEXT_ANIME:
        // Last anime, can't get next
        if (index === allAnime.length - 1) {
            return false
        }

        return allAnime[index + 1]

    case ACTIONS.PREV_ANIME:
        // First anime, can't get previous
        if (index === 0) {
            return false
        }

        return allAnime[index - 1]

    default:
        return false
    }
}

/**
 * Get more data about an anime either form the API or cache.
 */
function getAnimeApiData(animeId, callback, errorCallback) {
    // Return cached data
    if (cachedApiData.hasOwnProperty(animeId)) {
        callback(cachedApiData[animeId])
        return
    }

    fetch(`https://api.jikan.moe/v3/anime/${animeId}`).then(response =>
        response.json()
    ).then(apiData => {
        // Handle errors
        if (apiData.hasOwnProperty('error')) {
            console.error('API responded with an error:', apiData.error)
            errorCallback(apiData.error)
            return
        }

        // Save this anime's data so we don't have to fetch it in the future
        cachedApiData[animeId] = apiData

        callback(apiData)
    }, error => {
        // Handle errors
        console.error('Error while fetching API:', error)
        errorCallback(error)
    })
}

// Exports
export {
    getNestedProperty,
    replaceSpecialChars,
    convertDuration,
    getAdjacentAnime,
    getAnimeApiData,
}
