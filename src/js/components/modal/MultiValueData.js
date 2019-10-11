// React
import React from 'react'

// Libraries
import has from 'has'

// Data
import { FILTERS } from 'js/data/Filters'

/**
 * Array of values which should be comma-separated. Can look up description from filters.
 */
function MultiValueData({ data, ...anime }) {
    // No data, fallback on a dash
    if (!data) {
        return <>&mdash;</>
    }

    // If data is an array, make a comma-separated list
    if (Array.isArray(data) && data.length) {
        return data.join(', ')
    }

    // If the data property is not present on the anime, or it's not an array with values,
    // fallback on a dash
    if (!has(anime, data) || !Array.isArray(anime[data]) || !anime[data].length) {
        return <>&mdash;</>
    }

    // Get the data from the anime as a comma-separated list
    return anime[data].map(value => {
        // If this data has a definition in the filters data, use that instead
        if (has(FILTERS, data) && has(FILTERS[data].descriptions, value)) {
            return FILTERS[data].descriptions[value]
        }

        return value
    }).join(', ')
}

export default MultiValueData
