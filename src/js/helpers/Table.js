// Helpers
import { FILTERS } from 'js/data/Filters'
import { STORAGE_SIZE_LIMITS } from 'js/data/Table'

/**
 * Returns the colour name for a given overall file quality.
 * @param {number} fileQuality Number from 0 to 5 representing the overall quality of the files in the anime.
 * @returns {string}
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
 * Returns the colour name based on the column and its contents (taken from filters or overall file quality).
 * @param {string} columnName Name of the column.
 * @param {string|number} value Value of the contents of this column.
 * @returns {string}
 */
function getColumnTextColor(columnName, value) {
    // Special treatment for file quality
    if (columnName === 'fileQuality') {
        return getFileQualityColor(value)
    }

    // If color codes mapping exists for this column use it
    return FILTERS?.[columnName]?.colorCodes?.[value] || 'default'
}

/**
 * Returns the percentage size from 0 to 100 for a size bar based on the minimum and maximum sizes for that type.
 * @param {number} size The total size of the anime or average size of individual episodes.
 * @param {"total"|"episode"} type The type of size, either the total of the anime or episode average.
 * @returns {number}
 */
function getSizeBarWidth(size, type) {
    return ((size - STORAGE_SIZE_LIMITS[type].min) / STORAGE_SIZE_LIMITS[type].max) * 100
}

/**
 * Returns the colour name for a size bar based on the size band it falls into for its type.
 * @param {number} size The total size of the anime or average size of individual episodes.
 * @param {"total"|"episode"} type The type of size, either the total of the anime or episode average.
 * @returns {string}
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

// Exports
export {
    getColumnTextColor,
    getFileQualityColor,
    getSizeBarWidth,
    getSizeBarColor,
}
