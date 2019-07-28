import { Filters } from '../data/Filters'

/**
 * Retrieve column's text colour based on the value and filter.
 */
function getColumnTextColor(columnName, value) {
    // Special treatment for file quality
    if (columnName === 'fileQuality') {
        return getFileQualityColor(value)
    }

    // If color codes mapping exists for this column
    if (Filters.hasOwnProperty(columnName) && Filters[columnName].hasOwnProperty('colorCodes')) {
        return Filters[columnName].colorCodes[value]
    }

    return 'default'
}

/**
 * Returns the colour for a given file quality.
 */
function getFileQualityColor(fileQuality) {
    if (!fileQuality) {
        return 'default'
    }

    if (fileQuality <= 3) {
        return 'danger'
    }

    if (fileQuality <= 4.5) {
        return 'warning'
    }

    return 'success'
}

/**
 * Returns the ordinal suffix for a number.
 */
function formatOrdinal(number) {
    number = Math.abs(number)

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

// Exports
export {
    getColumnTextColor,
    getFileQualityColor,
    formatOrdinal,
}
