import { ACTIONS } from 'src/data/global-state'

// Object to cache API data to avoid fetching the same thing multiple times
const CACHED_API_DATA = new Map()

/**
 * Attempt to retrieve a deeply nested property from an object. Returns the value if found or false.
 *
 * @param {object} object The object to search.
 * @param {string} property The current property name to search for.
 * @param {string[]} rest The rest of deeper property names to search for after "property" is found.
 *
 * @returns {any} Value of the deep nested property if found.
 */
function getNestedProperty(object, property, ...rest) {
    if (!object) {
        return false
    }

    if (rest.length === 0 && object[property]) {
        return object[property]
    }

    return getNestedProperty(object[property], ...rest)
}

/**
 * Replaces special characters returned by the API into proper HTML entities.
 *
 * @param {string} string The string to replace characters in.
 *
 * @returns {string} String with special characters properly replaced.
 */
function replaceSpecialChars(string) {
    return string.replace(/&#(\d+);/g, (_, match) => String.fromCharCode(match))
}

/**
 * Returns the ID of the previous or next anime in the array relative to the current anime.
 *
 * @param {Array} allAnime Array of all anime objects.
 * @param {number} animeId ID of the current anime.
 * @param {ACTIONS} direction The direction to go from the current anime. Either `NEXT_ANIME` or `PREV_ANIME`.
 *
 * @returns {boolean|number} ID of the previous or next anime, or `false` if there isn't one.
 */
function getAdjacentAnime(allAnime, animeId, direction) {
    const index = allAnime.findIndex((anime) => anime.id === animeId)

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
 * Retrieves more information about an anime from the API or cache if already previously retrieved.
 *
 * @param {number} animeId ID of the anime to retrieve.
 * @param {boolean|number} isRetry Whether this request is a retry, and if so the retry count number.
 *
 * @returns {object} API data.
 */
async function getAnimeApiData(animeId, isRetry = false) {
    // Return cached data
    if (CACHED_API_DATA.has(animeId)) {
        return CACHED_API_DATA.get(animeId)
    }

    // Stop after too many retries
    if (isRetry > 5) {
        throw new Error('Too many API retries')
    }

    // Wait at least 2 seconds between API requests, increasing with each retry
    if (isRetry) {
        await new Promise((resolve) => {
            setTimeout(resolve, isRetry * 2000)
        })
    }

    // Attempt to get API data
    let response

    try {
        response = await fetch(`https://api.jikan.moe/v3/anime/${animeId}`)
    } catch (error) {
        throw new Error('A network error occurred')
    }

    // If any response other than 200 was returned, try again
    if (response.status !== 200) {
        return getAnimeApiData(animeId, isRetry ? isRetry + 1 : 1)
    }

    // Attempt to parse API daa
    let apiData

    try {
        apiData = await response.json()
    } catch (error) {
        throw new Error('Could not parse API data')
    }

    // Handle other errors returned by the API
    if (apiData.error) {
        throw new Error('API responded with an error')
    }

    // Save this anime's data so we don't have to fetch it in the future
    CACHED_API_DATA.set(animeId, apiData)

    return apiData
}

export { getNestedProperty, replaceSpecialChars, getAdjacentAnime, getAnimeApiData }
