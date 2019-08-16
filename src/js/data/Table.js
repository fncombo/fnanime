// Storage size limits
const StorageSizeLimits = {
    // 1GB min, 50GB max
    total: {
        min: 1073741824,
        max: 53687091200,
        medium: 53687091200 * 0.5,
        large: 53687091200 * 0.75,
    },
    // 50MB mib, 2GB max
    episode: {
        min: 52428800,
        max: 2147483648,
        medium: 2147483648 * 0.5,
        large: 2147483648 * 0.75,
    },
}

// Column sizes
const ColumnSizes = {
    small: '5%',
    medium: '8%',
    large: '12%',
}

// Sorting directions
const SortingOrders = {
    asc: 'asc',
    desc: 'desc',
}

// Columns setup
const Columns = {
    title: {
        text: 'Title',
        defaultSorting: SortingOrders.asc,
        size: '23%',
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
        text: 'Subtitles',
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
}
