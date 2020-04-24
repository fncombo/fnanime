import { anime as ANIME_OBJECT } from 'src/data/data.json'
import { FILTERS } from 'src/data/Filters'
import { SORTING_ORDERS } from 'src/data/Table'

import { calculateAdditionalData } from 'src/helpers/Data'

// Array of all current anime IDs
const ANIME_IDS = Object.keys(ANIME_OBJECT)

// Array of all props an anime has
const ANIME_PROPS = Object.keys(ANIME_OBJECT[ANIME_IDS[0]])

// Various default values for the app
const DEFAULTS = {
    // Table sorting first by status then by title
    sorting: new Map([
        ['status', SORTING_ORDERS.asc],
        ['favorite', SORTING_ORDERS.asc],
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

// Add additional data to each anime
calculateAdditionalData(ANIME_IDS)

// Populate default filter data and filter values.
FILTERS.createDefaults(ANIME_OBJECT)

// Exports
export { ANIME_OBJECT, ANIME_PROPS, DEFAULTS }
