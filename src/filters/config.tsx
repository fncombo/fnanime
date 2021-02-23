import { Anime, Filter, FilterOption, FilterOptions, FiltersConfig } from '../types'

const scoreFilter: Filter<'score'> = {
    key: 'score',
    span: 24,
    options: [
        {
            label: <>All Scores</>,
            value: -1,
        },
        {
            label: <>Masterpiece &ndash; 10</>,
            value: 10,
        },
        {
            label: <>Great &ndash; 9</>,
            value: 9,
        },
        {
            label: <>Very Good &ndash; 8</>,
            value: 8,
        },
        {
            label: <>Good &ndash; 7</>,
            value: 7,
        },
        {
            label: <>Fine &ndash; 6</>,
            value: 6,
        },
        {
            label: <>Average &ndash; 5</>,
            value: 5,
        },
        {
            label: <>Bad &ndash; 4</>,
            value: 4,
        },
        {
            label: <>Very Bad &ndash; 3</>,
            value: 3,
        },
        {
            label: <>Horrible &ndash; 2</>,
            value: 2,
        },
        {
            label: <>Appalling &ndash; 1</>,
            value: 1,
        },
        {
            label: <>Not Rated</>,
            value: 0,
        },
    ],
}

const typeFilter: Filter<'type'> = {
    key: 'type',
    span: 12,
    options: [
        {
            label: 'All Types',
            value: -1,
        },
        {
            label: 'TV',
            value: 'TV',
        },
        {
            label: 'OVA',
            value: 'OVA',
        },
        {
            label: 'Movie',
            value: 'Movie',
        },
        {
            label: 'Special',
            value: 'Special',
        },
        {
            label: 'ONA',
            value: 'ONA',
        },
        {
            label: 'Unknown',
            value: 'Unknown',
        },
    ],
}

const sourceFilter: Filter<'source'> = {
    key: 'source',
    span: 12,
    isAdvanced: true,
    options: [
        {
            label: 'All Sources',
            value: -1,
        },
        {
            label: 'BD',
            value: 'BD',
            color: 'green',
        },
        {
            label: 'DVD',
            value: 'DVD',
            color: 'green',
        },
        {
            label: 'TV',
            value: 'TV',
            color: 'red',
        },
        {
            label: 'Web',
            value: 'Web',
            color: 'orange',
        },
    ],
}

const watchingStatusFilter: Filter<'watchingStatus'> = {
    key: 'watchingStatus',
    span: 12,
    options: [
        {
            label: 'All Statuses',
            value: -1,
        },
        {
            label: 'Watching',
            value: 'Watching',
            color: 'green',
        },
        {
            label: 'Completed',
            value: 'Completed',
            color: 'blue',
        },
        {
            label: 'On-Hold',
            value: 'On-Hold',
            color: 'orange',
        },
        {
            label: 'Dropped',
            value: 'Dropped',
            color: 'red',
        },
        {
            label: 'Planned',
            value: 'Planned',
        },
    ],
}

const resolutionFilter: Filter<'resolution'> = {
    key: 'resolution',
    isAdvanced: true,
    span: 12,
    options: [
        {
            label: 'All Resolutions',
            value: -1,
        },
        {
            label: '1080p',
            value: 1080,
            color: 'green',
        },
        {
            label: '720p',
            value: 720,
            color: 'orange',
        },
        {
            label: '576p',
            value: 576,
            color: 'red',
        },
        {
            label: '480p',
            value: 480,
            color: 'red',
        },
    ],
}

const isInCompareListFilter: Filter<'isInCompareList'> = {
    key: 'isInCompareList',
    isAdvanced: true,
    span: 4,
    options: [
        {
            label: 'All',
            value: -1,
        },
        {
            label: 'Duo',
            value: 0,
        },
        {
            label: 'Solo',
            value: 1,
        },
    ],
}

const videoCodecFilter: Filter<'videoCodec'> = {
    key: 'videoCodec',
    isAdvanced: true,
    span: 8,
    options: [
        {
            label: 'All Video Codecs',
            value: -1,
        },
        {
            label: 'AVC H.264',
            value: 'H.264',
            color: 'orange',
        },
        {
            label: 'HEVC H.265',
            value: 'H.265',
            color: 'green',
        },
    ],
}

const audioCodecFilter: Filter<'audioCodec'> = {
    key: 'audioCodec',
    isAdvanced: true,
    span: 12,
    options: [
        {
            label: 'All Audio Codecs',
            value: -1,
        },
        {
            label: 'AAC',
            value: 'AAC',
            color: 'orange',
        },
        {
            label: 'AC3',
            value: 'AC3',
            color: 'orange',
        },
        {
            label: 'DTS',
            value: 'DTS',
            color: 'green',
        },
        {
            label: 'FLAC',
            value: 'FLAC',
            color: 'green',
        },
        {
            label: 'Opus',
            value: 'Opus',
            color: 'orange',
        },
        {
            label: 'Other',
            value: 'Other',
            color: 'red',
        },
    ],
}

const releaseFilter: Filter<'release'> = {
    key: 'release',
    isAdvanced: true,
    isSelect: true,
    placeholder: 'Releases',
    options: [],
}

const genresFilter: Filter<'genres'> = {
    key: 'genres',
    isSelect: true,
    placeholder: 'Genres',
    options: [],
}

const studiosFilter: Filter<'studios'> = {
    key: 'studios',
    isSelect: true,
    placeholder: 'Studios',
    options: [],
}

const filtersConfig: FiltersConfig[] = [
    scoreFilter,
    typeFilter,
    sourceFilter,
    watchingStatusFilter,
    resolutionFilter,
    isInCompareListFilter,
    videoCodecFilter,
    audioCodecFilter,
    releaseFilter,
    genresFilter,
    studiosFilter,
] as FiltersConfig[]

const filtersDictionary = filtersConfig
    .filter(({ options }) => !!options)
    .reduce((outerAccumulator, { key, options }) => {
        const filterOptions = options as FilterOption<typeof key>[]

        outerAccumulator[key] = filterOptions
            .filter(({ value }) => value !== -1)
            .reduce((innerAccumulator, { label, value, color }) => {
                if (value !== undefined && value !== null && typeof value !== 'boolean' && !Array.isArray(value)) {
                    innerAccumulator[value] = { label, color }
                }

                return innerAccumulator
            }, {} as FilterOptions)

        return outerAccumulator
    }, {} as Record<keyof Anime, FilterOptions>)

export { filtersConfig, filtersDictionary }
