// Libraries
import clone from 'clone'
import has from 'has'
import fastSort from 'fast-sort'
import Fuse from 'fuse.js'

// Data
import { anime as ANIME_OBJECT } from 'js/data/data.json'
import { SORTING_ORDERS } from 'js/data/Table'
import { FILTERS } from 'js/data/Filters'

// Only the anime object's entries in an array
let ANIME_ARRAY = Object.values(ANIME_OBJECT)

for (const anime of ANIME_ARRAY) {
    if (anime.status < 5 && !anime.rating) {
        anime.rating = null
    } else if (!anime.rating) {
        anime.rating = false
    }
}

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

// Various default values for the app
const DEFAULTS = {
    // Table sorting first by status then by title
    sorting: {
        status: SORTING_ORDERS.asc,
        title: SORTING_ORDERS.asc,
    },
    // Filtering is populated later based on all available filters
    filters: {},
    // Rows per table page
    perPage: 25,
    // Number of buttons on each side of the current page button
    pageButtons: 2,
}

/**
 * Populate default filter data and filter values.
 */
function createFilterDefaults() {
    for (const filterName of Object.keys(FILTERS)) {
        // Populate only the filter values which have some data to them
        let filterValues = ANIME_ARRAY
            .map(anime => anime[filterName])
            .flat()
            .filter((value, index, self) => self.indexOf(value) === index && value !== false)
            .sort()

        // Apply any special processing for this filter
        if (has(FILTERS[filterName], 'specialValuesProcess')) {
            filterValues = FILTERS[filterName].specialValuesProcess(filterValues)
        }

        // Add the "all" option at the start
        filterValues.unshift(false)

        // Set the default value for this filter
        DEFAULTS.filters[filterName] = false

        // Populate filter values in filter data
        FILTERS[filterName].values = filterValues
    }
}

createFilterDefaults()

/**
 * Calculate the file quality of an anime based on the video and audio properties.
 */
function getFileQuality(anime) {
    let measuredStats = 0
    let totalMeasure = 0

    for (const [ key, value ] of Object.entries(anime)) {
        if (value === false || value === null) {
            continue
        }

        if (!has(FILTERS, key) || !has(FILTERS[key], 'fileQuality') || !has(FILTERS[key].fileQuality, value)) {
            continue
        }

        measuredStats += 1

        totalMeasure += FILTERS[key].fileQuality[value]
    }

    if (!measuredStats) {
        return false
    }

    return totalMeasure / measuredStats
}

// Add data to an anime that didn't need to be downloaded because it can be calculated on the fly
for (const animeId of Object.keys(ANIME_OBJECT)) {
    // Reference back to object value
    const anime = ANIME_OBJECT[animeId]

    // Calculate values on the fly
    anime.episodeSize = anime.size && anime.episodes ? anime.size / anime.episodes : 0

    anime.fileQuality = getFileQuality(anime)

    anime.totalDuration = anime.episodeDuration * anime.episodes

    anime.watchTime = anime.episodeDuration * anime.episodesWatched * (anime.rewatchCount + 1)
}

/**
 * Update info about an anime from provided new API data.
 */
function updateAnimeData(animeId, newData) {
    // Don't update if anime doesn't exist
    if (!has(ANIME_OBJECT, animeId)) {
        return
    }

    // Check that the rating is non-0
    if (!newData.rating) {
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

    // Update the array of all anime
    ANIME_ARRAY = Object.values(ANIME_OBJECT)
}

/**
 * Search, sort and filter all anime.
 */
function getAnime(searchQuery = null, sorting = DEFAULTS.sorting, filters = DEFAULTS.filters) {
    // Start with all the anime
    let results = [ ...ANIME_ARRAY ]
    let actualSorting = sorting

    // Add sorting alphabetically by title if not already, to make it more consistent and predictable
    if (!has(sorting, 'title')) {
        // Copy to not modify actual sorting settings
        actualSorting = {
            ...sorting,
            title: SORTING_ORDERS.asc,
        }
    }

    // Go through each filter, narrowing down results each time, but don't filter when there is no value
    const actualFilters = Object.entries(filters).filter(([ , filterValue ]) => filterValue !== false)

    if (actualFilters.length) {
        for (const [ filterName, filterValue ] of actualFilters) {
            results = results.filter(anime => {
                // If it's an array of filter values, check if this filter value is present
                if (Array.isArray(anime[filterName])) {
                    return anime[filterName].includes(filterValue)
                }

                // Otherwise check if this filter value matches anime's value exactly
                return anime[filterName] === filterValue
            })
        }
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
        for (const prop of Object.keys(anime)) {
            const value = anime[prop]

            // Replace false and 0 values with undefined so that they are always sorted to the bottom
            if (value === false || value === 0) {
                anime[prop] = undefined
            } else if (Array.isArray(value)) {
                // Extract value from array with 1 item
                if (value.length === 1) {
                    [ anime[prop] ] = value

                // For arrays with more than one value, sort it alphabetically and get the first one
                } else {
                    fastSort(value)

                    anime[prop] = value.shift()
                }
            }
        }
    }

    // Apply sorting with correct options
    const fastSortOptions = Object.entries(actualSorting).map(([ column, direction ]) => ({ [direction]: column }))

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
    ANIME_OBJECT,
    ANIME_ARRAY,
    DEFAULTS,
    getAnime,
    updateAnimeData,
    createFilterDefaults,
}
