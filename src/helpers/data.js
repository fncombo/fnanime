import clone from 'clone'
import fastSort from 'fast-sort'
import Fuse from 'fuse.js'

import { anime as ANIME_OBJECT } from 'src/helpers/data.json'
import { FILTERS } from 'src/helpers/filters'
import { SORTING_ORDERS } from 'src/helpers/table'

// Fuzzy search options
const FUSE_OPTIONS = {
    includeMatches: true,
    threshold: 0.2,
    location: 0,
    distance: 100,
    minMatchCharLength: 2,
    keys: ['title'],
}

// Array of all current anime IDs
const ANIME_IDS = Object.keys(ANIME_OBJECT).map(Number)

// Array of all props an anime has
const ANIME_PROPS = Object.keys(ANIME_OBJECT[ANIME_IDS[0]])

// Various default values for the app
const DEFAULTS = {
    // Table sorting first by status then by title
    sorting: new Map([
        ['status', SORTING_ORDERS.asc],
        // ['favorite', SORTING_ORDERS.asc],
        ['rating', SORTING_ORDERS.desc],
        ['title', SORTING_ORDERS.asc],
    ]),
    // Filtering is populated later based on all available filters
    filters: {},
    // Rows per table page
    perPage: 25,
    // Number of buttons on each side of the current page button
    pageButtons: 2,
}

// Populate default filter data and filter values.
FILTERS.createDefaults(ANIME_OBJECT)

/**
 * Returns the average file quality of an anime from 0 to 5 based on the video and audio properties.
 *
 * @param {object} anime Object of an anime's data.
 *
 * @returns {boolean|number} Number of the average file quality or false if it could not be calculated.
 */
function getFileQuality(anime) {
    let measuredStats = 0
    let totalMeasure = 0

    // Go through each value in the anime and check if it has a corresponding quality score
    for (const prop of ANIME_PROPS) {
        const value = anime[prop]
        const fileQuality = FILTERS?.[prop]?.fileQuality?.[value]

        if (fileQuality) {
            measuredStats += 1

            totalMeasure += fileQuality
        }
    }

    // Return the average quality score if any values were measured
    return measuredStats ? totalMeasure / measuredStats : false
}

/**
 * Addd data that didn't need to be downloaded to each anime because it can be calculated on the fly.
 *
 * @param {number[]} animeIds Array of anime IDs to loop.
 */
function calculateAdditionalData(animeIds) {
    for (const animeId of animeIds) {
        // Reference back to object value
        const anime = ANIME_OBJECT[animeId]

        // Calculate values on the fly
        anime.episodeSize = anime.size && anime.episodes ? anime.size / anime.episodes : 0

        anime.fileQuality = getFileQuality(anime)

        anime.totalDuration = anime.episodeDuration * anime.episodes

        anime.watchTime = anime.episodeDuration * anime.episodesWatched * (anime.rewatchCount + 1)

        anime.updated = false
    }
}

// Add additional data to each anime
calculateAdditionalData(ANIME_IDS)

/**
 * Returns the searched, sorted, and filtered array of anime to display.
 *
 * @param {string} searchQuery String to search for in the anime title.
 * @param {Map} sorting Map of the current table sorting settings.
 * @param {object} filters Object of currently active filter names and their values.
 *
 * @returns {Array} Searched, sorted, and filtered array of anime.
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
    for (const [filterName, filterValue] of Object.entries(filters)) {
        // Ignore "all" filter values
        if (filterValue === false) {
            continue
        }

        results = results.filter((anime) => {
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
        results = new Fuse(results, FUSE_OPTIONS)
            .search(searchQuery)
            .map(({ item, matches: [{ indices: highlight } = { indices: false }] }) => ({ ...item, highlight }))
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
                if (value.length === 1) {
                    // Extract value from array with 1 item
                    // eslint-disable-next-line prefer-destructuring
                    anime[prop] = value[0]
                } else if (value.length) {
                    // For arrays with more than one value, sort it alphabetically and get the first one
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

    for (const [column, order] of actualSorting) {
        fastSortOptions.push({ [order]: column })
    }

    // Insert sorting by favorite just before the title, to make favorite anime (usually) first in the list
    // if (!actualSorting.has('favorite')) {
    //     const titleIndex = fastSortOptions.findIndex(({ asc, desc }) => asc === 'title' || desc === 'title')

    //     fastSortOptions.splice(titleIndex, 0, { asc: 'favorite' })
    // }

    fastSort(sortResults).by(fastSortOptions)

    // Map which anime ID should be in which order
    sortResults = sortResults.reduce((accumulator, anime, index) => {
        accumulator[anime.id] = index

        return accumulator
    }, {})

    // Sort the real results based on the sorting outcome, to preserve difference between false and null values
    for (const anime of results) {
        anime.index = sortResults[anime.id]
    }

    fastSort(results).asc('index')

    return results
}

export { ANIME_OBJECT, ANIME_PROPS, DEFAULTS, getFileQuality, calculateAdditionalData, getAnime }
