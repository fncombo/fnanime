import { isNumber } from 'is-what'

import { FILTERS } from 'src/helpers/filters'

// Storage size limits
const STORAGE_SIZE_LIMITS = {
    total: {
        // 1GB
        min: 1073741824,
        // 50 GB
        max: 53687091200,
        // 12.5 GB
        small: 13421772800,
        // 25 GB
        medium: 26843545600,
        // 50 GB
        large: 53687091200,
    },
    episode: {
        // 100 MB
        min: 104857600,
        // 2 GB
        max: 2147483648,
        // 500 MB
        small: 524288000,
        // 1 GB
        medium: 1073741824,
        // 2BG
        large: 2147483648,
    },
}

// Column sizes
const COLUMN_SIZES = {
    small: '5%',
    medium: '7%',
    large: '15%',
}

// Sorting directions
const SORTING_ORDERS = {
    asc: 'asc',
    desc: 'desc',
}

// Sorting icons
const SORTING_ICONS = {
    asc: 'sort-up',
    desc: 'sort-down',
}

// Columns setup
const TABLE_COLUMNS = {
    title: {
        text: 'Title',
        defaultSorting: SORTING_ORDERS.asc,
        size: 'auto',
    },
    status: {
        text: 'Status',
        defaultSorting: SORTING_ORDERS.asc,
        size: 'auto',
    },
    rating: {
        text: 'Rating',
        defaultSorting: SORTING_ORDERS.desc,
        size: COLUMN_SIZES.small,
    },
    rewatchCount: {
        text: 'Rewatched',
        defaultSorting: SORTING_ORDERS.desc,
        size: COLUMN_SIZES.medium,
    },
    subs: {
        text: 'Release',
        defaultSorting: SORTING_ORDERS.asc,
        size: COLUMN_SIZES.medium,
    },
    resolution: {
        text: 'Resolution',
        defaultSorting: SORTING_ORDERS.desc,
        size: COLUMN_SIZES.medium,
    },
    source: {
        text: 'Source',
        defaultSorting: SORTING_ORDERS.asc,
        size: COLUMN_SIZES.small,
    },
    videoCodec: {
        text: 'Video',
        defaultSorting: SORTING_ORDERS.desc,
        size: COLUMN_SIZES.small,
    },
    audioCodec: {
        text: 'Audio',
        defaultSorting: SORTING_ORDERS.desc,
        size: COLUMN_SIZES.small,
    },
    fileQuality: {
        text: 'Quality',
        defaultSorting: SORTING_ORDERS.desc,
        size: COLUMN_SIZES.small,
    },
    episodeSize: {
        text: 'Episode Size',
        defaultSorting: SORTING_ORDERS.desc,
        size: COLUMN_SIZES.medium,
    },
    size: {
        text: 'Total Size',
        defaultSorting: SORTING_ORDERS.desc,
        size: COLUMN_SIZES.medium,
    },
}

// Only the keys (names) of all table columns
const TABLE_COLUMN_NAMES = Object.keys(TABLE_COLUMNS)

/**
 * Returns the colour name based on the column and its contents (taken from filters or overall file quality).
 *
 * @param {string} columnName Name of the column.
 * @param {string|number} value Value of the contents of this column.
 *
 * @returns {string} Colour name.
 */
function getColumnTextColor(columnName, value) {
    // Special treatment for file quality
    if (columnName === 'fileQuality') {
        if (!isNumber(value)) {
            return 'default'
        }

        if (value < 2.75) {
            return 'red'
        }

        if (value < 3.75) {
            return 'orange'
        }

        if (value < 4.75) {
            return 'yellow'
        }

        return 'green'
    }

    // If color codes mapping exists for this column use it
    return FILTERS?.[columnName]?.colorCodes?.[value] || 'default'
}

/**
 * Returns the percentage size from 0 to 100 for a size bar based on the minimum and maximum sizes for that type.
 *
 * @param {number} size The total size of the anime or average size of individual episodes.
 * @param {"total"|"episode"} type The type of size, either the total of the anime or episode average.
 *
 * @returns {number} Percentage from 0 to 100.
 */
function getSizeBarWidth(size, type) {
    return ((size - STORAGE_SIZE_LIMITS[type].min) / STORAGE_SIZE_LIMITS[type].max) * 100
}

/**
 * Returns the colour name for a size bar based on the size band it falls into for its type.
 *
 * @param {number} size The total size of the anime or average size of individual episodes.
 * @param {"total"|"episode"} type The type of size, either the total of the anime or episode average.
 *
 * @returns {string} Colour name.
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

export {
    TABLE_COLUMNS,
    TABLE_COLUMN_NAMES,
    STORAGE_SIZE_LIMITS,
    SORTING_ORDERS,
    SORTING_ICONS,
    getColumnTextColor,
    getSizeBarWidth,
    getSizeBarColor,
}
