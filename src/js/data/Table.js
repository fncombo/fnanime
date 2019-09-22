// Storage size limits
const StorageSizeLimits = {
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
const ColumnSizes = {
    small: '5%',
    medium: '7%',
    large: '15%',
}

// Sorting directions
const SortingOrders = {
    asc: 'asc',
    desc: 'desc',
}

// Sorting icons
const SortingIcons = {
    asc: 'sort-up',
    desc: 'sort-down',
}

// Columns setup
const Columns = {
    title: {
        text: 'Title',
        defaultSorting: SortingOrders.asc,
        size: 'auto',
    },
    status: {
        text: 'Status',
        defaultSorting: SortingOrders.asc,
        size: ColumnSizes.large,
    },
    rating: {
        text: 'Rating',
        defaultSorting: SortingOrders.desc,
        size: ColumnSizes.small,
    },
    rewatchCount: {
        text: 'Rewatched',
        defaultSorting: SortingOrders.desc,
        size: ColumnSizes.medium,
    },
    subs: {
        text: 'Release',
        defaultSorting: SortingOrders.asc,
        size: ColumnSizes.medium,
    },
    resolution: {
        text: 'Resolution',
        defaultSorting: SortingOrders.desc,
        size: ColumnSizes.medium,
    },
    source: {
        text: 'Source',
        defaultSorting: SortingOrders.desc,
        size: ColumnSizes.small,
    },
    videoCodec: {
        text: 'Video',
        defaultSorting: SortingOrders.desc,
        size: ColumnSizes.small,
    },
    audioCodec: {
        text: 'Audio',
        defaultSorting: SortingOrders.desc,
        size: ColumnSizes.small,
    },
    fileQuality: {
        text: 'Quality',
        defaultSorting: SortingOrders.desc,
        size: ColumnSizes.small,
    },
    episodeSize: {
        text: 'Episode Size',
        defaultSorting: SortingOrders.desc,
        size: ColumnSizes.medium,
    },
    size: {
        text: 'Total Size',
        defaultSorting: SortingOrders.desc,
        size: ColumnSizes.medium,
    },
}

// Exports
export {
    Columns,
    StorageSizeLimits,
    SortingOrders,
    SortingIcons,
}
