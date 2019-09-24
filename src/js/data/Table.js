// Storage size limits
const STORAGE_SIZE_LIMITS = {
    total: {
        // 1GB
        min: 1 * 1e9,
        // 50 GB
        max: 50 * 1e9,
        // 10 GB
        small: 10 * 1e9,
        // 25 GB
        medium: 25 * 1e9,
        // 50 GB
        large: 50 * 1e9,
    },
    episode: {
        // 100 MB
        min: 100 * 1e6,
        // 2 GB
        max: 2 * 1e9,
        // 500 MB
        small: 500 * 1e6,
        // 1 GB
        medium: 1 * 1e9,
        // 2BG
        large: 2 * 1e9,
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
        size: COLUMN_SIZES.large,
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
        defaultSorting: SORTING_ORDERS.desc,
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

// Exports
export {
    TABLE_COLUMNS,
    STORAGE_SIZE_LIMITS,
    SORTING_ORDERS,
    SORTING_ICONS,
}
