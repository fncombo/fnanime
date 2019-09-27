// React
import React from 'react'

// Libraries
import has from 'has'
import reactStringReplace from 'react-string-replace'

// Helpers
import { FILTERS } from 'js/data/Filters'
import { STORAGE_SIZE_LIMITS } from 'js/data/Table'

/**
 * Returns the colour for a given file quality.
 */
function getFileQualityColor(fileQuality) {
    if (!fileQuality) {
        return 'default'
    }

    if (fileQuality < 2.75) {
        return 'red'
    }

    if (fileQuality < 3.75) {
        return 'orange'
    }

    if (fileQuality < 4.75) {
        return 'yellow'
    }

    return 'green'
}

/**
 * Retrieve column's text colour based on the value and filter.
 */
function getColumnTextColor(columnName, value) {
    // Special treatment for file quality
    if (columnName === 'fileQuality') {
        return getFileQualityColor(value)
    }

    // If color codes mapping exists for this column
    if (has(FILTERS, columnName) && has(FILTERS[columnName], 'colorCodes')) {
        return FILTERS[columnName].colorCodes[value]
    }

    return 'default'
}

/**
 * Returns the width for a size bar based on the min and max sizes for that type.
 */
function getSizeBarWidth(size, type) {
    return ((size - STORAGE_SIZE_LIMITS[type].min) / STORAGE_SIZE_LIMITS[type].max) * 100
}

/**
 * Returns the colour for a size bar based on the size and the type (episode or whole anime).
 */
function getSizeBarColor(size, type) {
    if (size > STORAGE_SIZE_LIMITS[type].large) {
        return 'red'
    }

    if (size > STORAGE_SIZE_LIMITS[type].medium) {
        return 'orange'
    }

    if (size > STORAGE_SIZE_LIMITS[type].small) {
        return 'yellow'
    }

    return 'green'
}

/**
 * Returns the ordinal suffix for a number.
 */
function formatOrdinal(number) {
    const cent = number % 100

    if (cent >= 10 && cent <= 20) {
        return 'th'
    }

    const dec = number % 10

    if (dec === 1) {
        return 'st'
    } else if (dec === 2) {
        return 'nd'
    } else if (dec === 3) {
        return 'rd'
    }

    return 'th'
}

// If there was a search query and highlight indices have been provided, highlight matches results using them
function highlightTitle(title, highlight) {
    // Get unique parts of the title to highlight, sorted from longest to shortest
    const parts = [ ...new Set(highlight.map(([ start, end ]) => title.slice(start, end + 1).toUpperCase())) ]
        .sort((a, b) => b.length - a.length)

    // Construct a regex to match the title parts
    const matches = RegExp(`(${parts.join('|')})`, 'gi')

    return reactStringReplace(title, matches, (match, i) => <strong key={match + i}>{match}</strong>)
}

// Exports
export {
    getColumnTextColor,
    getFileQualityColor,
    getSizeBarWidth,
    getSizeBarColor,
    formatOrdinal,
    highlightTitle,
}
