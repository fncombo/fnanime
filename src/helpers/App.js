import clone from 'clone'

import { DEFAULTS } from 'src/data/Data'
import { FILTER_NAMES, FILTERS } from 'src/data/Filters'
import { TABLE_COLUMN_NAMES, SORTING_ORDERS } from 'src/data/Table'

/**
 * Get updated API date to display the latest info such as episode watch progress.
 */
async function getApiData(page = 1, isRetry = false) {
    // Collect new API data
    let newApiData = []

    // Stop after too many retries
    if (isRetry > 5) {
        return false
    }

    // Wait at least 2 seconds between API requests, increasing by 2 seconds with each retry
    if (page > 1 || isRetry) {
        await new Promise((resolve) => {
            setTimeout(resolve, (isRetry || 1) * 2000)
        })
    }

    // Get the data
    let response

    try {
        response = await fetch(`https://api.jikan.moe/v3/user/fncombo/animelist/all/${page}`)

        // Force retry if non-200 status
        if (!response.ok) {
            throw new Error()
        }
    } catch (error) {
        const retryData = await getApiData(page, isRetry ? isRetry + 1 : 1)

        if (!retryData) {
            return false
        }

        newApiData = newApiData.push(...retryData)
    }

    // Parse JSON response
    let responseJson

    try {
        responseJson = await response.json()
    } catch (error) {
        return false
    }

    // Check that anime data actually exists in the API response
    if (!responseJson.anime || !Array.isArray(responseJson.anime) || !responseJson.anime.length) {
        return false
    }

    newApiData.push(...responseJson.anime)

    // If this page was full (300 entries per page), get the next page
    if (responseJson.anime.length === 300) {
        const nextPageData = await getApiData(page + 1)

        if (!nextPageData) {
            return false
        }

        newApiData = newApiData.concat(...nextPageData)
    }

    return newApiData
}

/**
 * Returns complete and validated filtering, sorting, and search data found in the query string.
 */
function getUrlQueryStringData() {
    // Check if the string has data to work with
    const queryString = window.location.search.length > 1 ? window.location.search : false

    if (!queryString) {
        return false
    }

    // Remove the ? and split by &
    const data = queryString
        .slice(1)
        .split('&')
        .reduce(
            (accumulator, fragment) => {
                // Attempt to get the key and value of the fragment
                const fragments = fragment.split('=')

                // Data is not formatted correctly
                if (fragments.length !== 2) {
                    return accumulator
                }

                const [key] = fragments
                let [, value] = fragments

                // If this is the search query data, add it as-is
                if (key === 'search') {
                    accumulator.searchQuery = value

                    return accumulator
                }

                // Split again by dash to separate filters and sorting data
                const keyFragments = key.split('-')

                // Data is not formatted correctly
                if (keyFragments.length !== 2) {
                    return accumulator
                }

                const [keyType, keyValue] = keyFragments

                // Sorting data
                if (keyType === 'sorting') {
                    const column = keyValue

                    // Check if this is valid table column or the hidden "favorite" field, and that the sorting order is valid
                    if ((TABLE_COLUMN_NAMES.includes(column) || column === 'favorite') && SORTING_ORDERS[value]) {
                        const index = parseInt(key.slice(0, 2), 10)

                        // Add sorting data along with the index
                        accumulator.activeSorting.push([index, column, SORTING_ORDERS[value]])
                    }

                    return accumulator
                }

                // Filters data
                if (keyType === 'filter') {
                    const filterName = keyValue

                    // Check if filer name exists
                    if (!FILTER_NAMES.includes(filterName)) {
                        return accumulator
                    }

                    // Decode data
                    value = decodeURIComponent(value)

                    // Convert null to proper type
                    if (value === 'null') {
                        value = null

                        // Parse numbers
                    } else if (/^\d+$/.test(value)) {
                        value = parseInt(value, 10)
                    }

                    // Check if the filter value exists
                    if (!FILTERS[filterName]?.values.includes(value)) {
                        return accumulator
                    }

                    // Assign the filter name to filter value
                    accumulator.activeFilters[filterName] = value

                    return accumulator
                }

                return accumulator
            },
            {
                activeSorting: [],
                activeFilters: {},
            }
        )

    // Convert the sorting array to a proper Map
    if (data.activeSorting.length) {
        data.activeSorting = data.activeSorting
            .sort(([a], [b]) => a - b)
            .reduce((accumulator, [, column, order]) => {
                accumulator.set(column, order)

                return accumulator
            }, new Map())

        // Use default sorting if it was missing
    } else {
        data.activeSorting = clone(DEFAULTS.sorting)
    }

    // Merge filter data with defaults if anything was missing
    data.activeFilters = {
        ...clone(DEFAULTS.filters),
        ...data.activeFilters,
    }

    return data
}

/**
 * Updates the URL to reflect the provided search, sorting, and filtering.
 * @param {string} searchQuery Current search string.
 * @param {Map} activeSorting Map of the current table sorting settings.
 * @param {Object} activeFilters Object of currently active filter names and their values.
 */
function updateUrlQueryString(searchQuery, activeSorting, activeFilters) {
    // Map of all filters, sorting, and the search query
    const data = new Map()

    // Process all filters
    for (const [filterName, filterValue] of Object.entries(activeFilters)) {
        if (filterValue !== false) {
            data.set(`filter-${filterName}`, filterValue)
        }
    }

    // Process sorting, due to sorting and data both being maps, the sorting order will be preserved
    for (const [column, direction] of activeSorting) {
        data.set(`sorting-${column}`, direction)
    }

    // Add search query, if any
    if (searchQuery) {
        data.set('search', searchQuery)
    }

    // Convert the map into a query string
    const queryString = []

    for (const [key, value] of data) {
        queryString.push(`${key}=${value}`)
    }

    // Update the URL
    window.history.replaceState(undefined, document.title, `${window.location.pathname}?${queryString.join('&')}`)
}

/**
 * Resets the URL.
 */
function resetUrlQueryString() {
    window.history.replaceState(undefined, document.title, window.location.pathname)
}

// Exports
export { getApiData, getUrlQueryStringData, updateUrlQueryString, resetUrlQueryString }
