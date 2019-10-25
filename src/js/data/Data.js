// Data
import { anime as ANIME_OBJECT } from 'js/data/data.json'
import { FILTERS } from 'js/data/Filters'
import { SORTING_ORDERS } from 'js/data/Table'

// Helpers
import { getFileQuality } from 'js/helpers/Data'

// Array of all current anime IDs
const ANIME_IDS = Object.keys(ANIME_OBJECT)

// Array of all props an anime has
const ANIME_PROPS = Object.keys(ANIME_OBJECT[ANIME_IDS[0]])

// Various default values for the app
const DEFAULTS = {
    // Table sorting first by status then by title
    sorting: new Map([
        [ 'status', SORTING_ORDERS.asc ],
        [ 'favorite', SORTING_ORDERS.asc ],
        [ 'rating', SORTING_ORDERS.desc ],
        [ 'title', SORTING_ORDERS.asc ],
    ]),
    // Filtering is populated later based on all available filters
    filters: {},
    // Rows per table page
    perPage: 25,
    // Number of buttons on each side of the current page button
    pageButtons: 2,
}

// Add data to an anime that didn't need to be downloaded because it can be calculated on the fly
for (const animeId of ANIME_IDS) {
    // Reference back to object value
    const anime = ANIME_OBJECT[animeId]

    // Calculate values on the fly
    anime.episodeSize = anime.size && anime.episodes ? anime.size / anime.episodes : 0

    anime.fileQuality = getFileQuality(anime)

    anime.totalDuration = anime.episodeDuration * anime.episodes

    anime.watchTime = anime.episodeDuration * anime.episodesWatched * (anime.rewatchCount + 1)
}

// Populate default filter data and filter values.
FILTERS.createDefaults(ANIME_OBJECT)

// Exports
export {
    ANIME_OBJECT,
    ANIME_PROPS,
    DEFAULTS,
}
