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
