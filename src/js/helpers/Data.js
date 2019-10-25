// Libraries
import clone from 'clone'
import has from 'has'
import fastSort from 'fast-sort'
import Fuse from 'fuse.js'

// Data
import { ANIME_OBJECT, ANIME_PROPS, DEFAULTS } from 'js/data/Data'
import { FILTERS } from 'js/data/Filters'
import { SORTING_ORDERS } from 'js/data/Table'

// Fuzzy search options
const FUSE_OPTIONS = {
    includeMatches: true,
    threshold: 0.2,
    location: 0,
    distance: 100,
    maxPatternLength: 32,
    minMatchCharLength: 2,
    keys: [ 'title' ],
}

/**
 * Calculate the file quality of an anime based on the video and audio properties.
 */
function getFileQuality(anime) {
    let measuredStats = 0
    let totalMeasure = 0

    for (const prop of ANIME_PROPS) {
        const value = anime[prop]

        if (value === false || value === null) {
            continue
        }

        if (!has(FILTERS, prop) || !has(FILTERS[prop], 'fileQuality') || !has(FILTERS[prop].fileQuality, value)) {
            continue
        }

        measuredStats += 1

        totalMeasure += FILTERS[prop].fileQuality[value]
    }

    if (!measuredStats) {
        return false
    }

    return totalMeasure / measuredStats
}

/**
 * Reverse lookup an anime's type from string to ID based on the filters data.
 */
function reverseTypeLookup(type) {
    const data = Object.entries(FILTERS.type.descriptions).find(([ , value ]) => value === type)

    return data ? parseInt(data[0], 10) : 0
}

/**
 * Create a very basic entry for a new anime from the API which didn't originally exist in the local data.
 */
function createAnimeFromApiData(animeId, anime) {
    ANIME_OBJECT[animeId] = {
        id: anime.mal_id,
        title: anime.title,
        type: reverseTypeLookup(anime.type),
        episodes: anime.total_episodes,
        episodesWatched: anime.watched_episodes,
        img: anime.image_url.match(/^[^?]+/)[0],
        status: anime.watching_status,
        airStatus: anime.airing_status,
        rating: anime.score || (anime.watching_status < 5 ? null : false),
        rewatchCount: 0,
        url: anime.url,
        favorite: false,
        genres: [],
        subs: [],
        resolution: false,
        source: false,
        videoCodec: false,
        bits: false,
        audioCodec: false,
        size: 0,
        updated: true,
    }
}

/**
 * Update info about an anime from provided new API data.
 */
function updateAnimeData(animeId, newData, fullData) {
    // If the anime doesn't exist, create an entry for it
    if (!has(ANIME_OBJECT, animeId)) {
        createAnimeFromApiData(animeId, fullData)

        return
    }

    // Check that the rating is different
    if (ANIME_OBJECT[animeId].rating === newData.rating) {
        delete newData.rating
    }

    // Figure out if any data for this anime has changed
    const changed = Object.entries(newData).some(([ newDataName, newDataValue ]) =>
        ANIME_OBJECT[animeId][newDataName] !== newDataValue
    )

    // Do not update if all data is the same
    if (!changed) {
        return
    }

    // Update with new data
    ANIME_OBJECT[animeId] = {
        ...ANIME_OBJECT[animeId],
        ...newData,
    }
}

/**
 * Update all anime from new API data. If the anime doesn't exist in the API, delete it.
 */
function updateAnimeFromApi(newAnime) {
    // Update each anime's data
    for (const anime of newAnime) {
        updateAnimeData(anime.mal_id, {
            status: anime.watching_status,
            airStatus: anime.airing_status,
            rating: anime.score || (anime.watching_status < 5 ? null : false),
            episodes: anime.total_episodes,
            episodesWatched: anime.watched_episodes,
            updated: true,
        }, anime)
    }

    // Delete anime which were not updated and therefore were not in the API
    for (const animeId of Object.keys(ANIME_OBJECT)) {
        if (!has(ANIME_OBJECT[animeId], 'updated')) {
            delete ANIME_OBJECT[animeId]
        }
    }

    // Re-create filter defaults based on new anime data
    FILTERS.createDefaults(ANIME_OBJECT)
}

/**
 * Search, sort and filter all anime.
 */
function getAnime(searchQuery = null, sorting = DEFAULTS.sorting, filters = DEFAULTS.filters) {
    // Start with all the anime
    let results = Object.values(ANIME_OBJECT)
    const actualSorting = clone(sorting)

    // Add sorting alphabetically by title if not already, to make it more consistent and predictable
    if (!actualSorting.has('title')) {
        actualSorting.set('title', SORTING_ORDERS.asc)
    }

    // Go through each filter, narrowing down results each time, but don't filter when there is no value
    for (const [ filterName, filterValue ] of Object.entries(filters)) {
        // Ignore "all" filter values
        if (filterValue === false) {
            continue
        }

        results = results.filter(anime => {
            // If it's an array of filter values, check if this filter value is present
            if (Array.isArray(anime[filterName])) {
                return anime[filterName].includes(filterValue)
            }

            // Otherwise check if this filter value matches anime's value exactly
            return anime[filterName] === filterValue
        })
    }

    // Perform the search query if there is one
    if (searchQuery && searchQuery.length) {
        results = new Fuse(results, FUSE_OPTIONS).search(searchQuery).map(({ item, matches: [
            { indices: highlight } = { indices: false },
        ] }) => ({ ...item, highlight }))
    }

    // Make a copy of results and re-map certain data without affecting current data to improve sorting
    let sortResults = clone(results)

    for (const anime of sortResults) {
        // This is better performance than doing Object.entries()
        for (const prop of ANIME_PROPS) {
            const value = anime[prop]

            // Replace false, null, and 0 values with undefined so that they are always sorted to the bottom
            if (!value) {
                anime[prop] = undefined
            } else if (Array.isArray(value)) {
                // Extract value from array with 1 item
                if (value.length === 1) {
                    [ anime[prop] ] = value

                // For arrays with more than one value, sort it alphabetically and get the first one
                } else if (value.length) {
                    fastSort(value)

                    anime[prop] = value.shift()

                // For empty arrays, sort to the bottom
                } else {
                    anime[prop] = undefined
                }
            }
        }
    }

    // Apply sorting with correct options
    const fastSortOptions = []

    for (const [ column, order ] of actualSorting) {
        fastSortOptions.push({ [order]: column })
    }

    // Insert sorting by favorite just before the title, to make favorite anime (usually) first in the list
    if (!actualSorting.has('favorite')) {
        const titleIndex = fastSortOptions.findIndex(({ asc, desc }) => asc === 'title' || desc === 'title')

        fastSortOptions.splice(titleIndex, 0, { asc: 'favorite' })
    }

    fastSort(sortResults).by(fastSortOptions)

    // Map which anime ID should be in which order
    sortResults = sortResults.reduce((object, anime, index) => {
        object[anime.id] = index

        return object
    }, {})

    // Sort the real results based on the sorting outcome, to preserve difference between false and null values
    for (const anime of results) {
        anime.index = sortResults[anime.id]
    }

    fastSort(results).asc('index')

    return results
}

// Exports
export {
    getFileQuality,
    updateAnimeFromApi,
    getAnime,
}
