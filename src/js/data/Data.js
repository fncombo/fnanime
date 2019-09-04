// Libraries
import fastSort from 'fast-sort'
import Fuse from 'fuse.js'

// Data
import AnimeObject from 'js/data/Anime.json'
import { SortingOrders } from 'js/data/Table'
import { Filters } from 'js/data/Filters'

// Only the anime object's entries in an array
let AnimeArray = Object.values(AnimeObject)

// Fuzzy search options
const FuseOptions = {
    includeMatches: true,
    threshold: 0.2,
    location: 0,
    distance: 100,
    maxPatternLength: 32,
    minMatchCharLength: 2,
    keys: [ 'title' ],
}

// Various default values for the app
const Defaults = {
    // Table sorting first by status then by title
    sorting: {
        status: SortingOrders.asc,
        title: SortingOrders.asc,
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
    for (const filterName of Object.keys(Filters)) {
        // Populate only the filter values which have some data to them
        let filterValues = AnimeArray
            .map(anime => anime[filterName])
            .filter((value, index, self) => self.indexOf(value) === index && value !== false)
            .sort()

        // Apply any special processing for this filter
        if (Filters[filterName].hasOwnProperty('specialValuesProcess')) {
            filterValues = Filters[filterName].specialValuesProcess(filterValues)
        }

        // Add the "all" option at the start
        filterValues.unshift(false)

        // Set the default value for this filter
        Defaults.filters[filterName] = false

        // Populate filter values in filter data
        Filters[filterName].values = filterValues
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

        if (!Filters.hasOwnProperty(key)
            || !Filters[key].hasOwnProperty('fileQuality')
            || !Filters[key].fileQuality.hasOwnProperty(value)
        ) {
            continue
        }

        measuredStats += 1

        totalMeasure += Filters[key].fileQuality[value]
    }

    if (!measuredStats) {
        return false
    }

    return totalMeasure / measuredStats
}

// Add data to an anime that didn't need to be downloaded because it can be calculated on the fly
for (const animeId of Object.keys(AnimeObject)) {
    // Reference back to object value
    const anime = AnimeObject[animeId]

    // Calculate values on the fly
    anime.episodeSize = anime.size && anime.episodes ? anime.size / anime.episodes : null

    anime.fileQuality = getFileQuality(anime)
}

/**
 * Update info about an anime from provided new API data.
 */
function updateAnimeData(animeId, newData) {
    // Don't update if anime doesn't exist
    if (!AnimeObject.hasOwnProperty(animeId)) {
        return
    }

    // Figure out if any data for this anime has changed
    const changed = Object.entries(newData).some(([ newDataName, newDataValue ]) =>
        AnimeObject[animeId][newDataName] !== newDataValue
    )

    // Do not update if all data is the same
    if (!changed) {
        return
    }

    // Update with new data
    AnimeObject[animeId] = {
        ...AnimeObject[animeId],
        ...newData,
    }

    // Update the array of all anime
    AnimeArray = Object.values(AnimeObject)
}

/**
 * Search, sort and filter all anime.
 */
function getAnime(searchQuery = null, sorting = Defaults.sorting, filters = Defaults.filters) {
    // Start with all the anime
    let results = [ ...AnimeArray ]
    let actualSorting = sorting

    // Add sorting alphabetically by title if not already, to make it more consistent and predictable
    if (!sorting.hasOwnProperty('title')) {
        // Copy to not modify actual sorting settings
        actualSorting = {
            ...sorting,
            title: SortingOrders.asc,
        }
    }

    // Go through each filter, narrowing down results each time, but don't filter when there is no value
    const actualFilters = Object.entries(filters).filter(([ , filterValue ]) => filterValue !== false)

    if (actualFilters.length) {
        for (const [ filterName, filterValue ] of actualFilters) {
            results = results.filter(anime => anime[filterName] === filterValue)
        }
    }

    // Perform the search query if there is one
    if (searchQuery && searchQuery.length) {
        results = new Fuse(results, FuseOptions).search(searchQuery).map(({ item, matches: [
            { indices: highlight } = { indices: false },
        ] }) => ({ ...item, highlight }))
    }

    // Finally apply all sorting
    fastSort(results).by(Object.entries(actualSorting).map(([ column, direction ]) => ({ [direction]: column })))

    return results
}

// Exports
export {
    AnimeObject,
    AnimeArray,
    Defaults,
    getAnime,
    updateAnimeData,
    createFilterDefaults,
}
