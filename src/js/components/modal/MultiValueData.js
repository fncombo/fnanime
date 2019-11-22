// React
import React from 'react'

// Data
import { FILTERS } from 'js/data/Filters'

/**
 * Array of values which should be comma-separated. Can look up description from filters.
 */
export default function MultiValueData({ data, ...anime }) {
    // No data, fallback on a dash
    if (!data) {
        return <>&mdash;</>
    }

    // If data is an array, make a comma-separated list
    if (Array.isArray(data) && data.length) {
        return data.join(', ')
    }

    // If the data property is not present on the anime, or it's not an array with values, fallback on a dash
    if (!anime[data] || !Array.isArray(anime[data]) || !anime[data].length) {
        return <>&mdash;</>
    }

    // Get the data from the anime as a comma-separated list
    // If this data has a definition in the filters data, use that instead
    return anime[data].map(value => FILTERS?.[data].descriptions?.[value] || value).join(', ')
}