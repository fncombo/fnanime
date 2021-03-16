import { ReactNode } from 'react'

import { Anime } from '../types'

type FilterName = keyof Pick<
    Anime,
    | 'score'
    | 'type'
    | 'source'
    | 'watchingStatus'
    | 'resolution'
    | 'isInCompareList'
    | 'videoCodec'
    | 'audioCodec'
    | 'release'
    | 'genres'
    | 'studios'
>

type FilterValue = string | number

type FilterColor = 'green' | 'orange' | 'red' | 'blue'

interface AnimeFilter<T extends FilterName> {
    name: T
    span?: number
    isAdvanced?: boolean
    isSelect?: boolean
    placeholder?: string
    options?: {
        label: ReactNode
        value: -1 | Anime[T]
        color?: FilterColor
    }[]
}

interface FilterOption {
    label: ReactNode
    value: FilterValue
    animeCount: number
    color?: FilterColor
}

interface Filter {
    name: FilterName
    options: FilterOption[]
    filterValue: FilterValue
    span?: number
    isAdvanced?: boolean
    isSelect?: boolean
    placeholder?: string
}

type FilterDictionary = Record<
    FilterValue,
    {
        label: ReactNode
        color?: FilterColor
    }
>

const scoreFilter: AnimeFilter<'score'> = {
    name: 'score',
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

const typeFilter: AnimeFilter<'type'> = {
    name: 'type',
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

const sourceFilter: AnimeFilter<'source'> = {
    name: 'source',
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

const watchingStatusFilter: AnimeFilter<'watchingStatus'> = {
    name: 'watchingStatus',
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

const resolutionFilter: AnimeFilter<'resolution'> = {
    name: 'resolution',
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

const isInCompareListFilter: AnimeFilter<'isInCompareList'> = {
    name: 'isInCompareList',
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

const videoCodecFilter: AnimeFilter<'videoCodec'> = {
    name: 'videoCodec',
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

const audioCodecFilter: AnimeFilter<'audioCodec'> = {
    name: 'audioCodec',
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

const releaseFilter: AnimeFilter<'release'> = {
    name: 'release',
    isAdvanced: true,
    isSelect: true,
    placeholder: 'Releases',
}

const genresFilter: AnimeFilter<'genres'> = {
    name: 'genres',
    isSelect: true,
    placeholder: 'Genres',
}

const studiosFilter: AnimeFilter<'studios'> = {
    name: 'studios',
    isSelect: true,
    placeholder: 'Studios',
}

const filtersConfig = [
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
] as Filter[]

// Create an object for each filter name which contains an object of its values mapped to their label and color
const filtersDictionary = filtersConfig
    // Skip filters without predefined options
    .filter(({ options }) => !!options)
    // Create an object of each filter name to all its values
    .reduce((outerAccumulator, { name, options }) => {
        outerAccumulator[name] = options
            // Skip the "all" option
            .filter(({ value }) => value !== -1)
            // Create an object of each filter value to its label and color
            .reduce((innerAccumulator, { label, value, color }) => {
                innerAccumulator[value] = {
                    label,
                    color,
                }

                return innerAccumulator
            }, {} as FilterDictionary)

        return outerAccumulator
    }, {} as Record<FilterName, FilterDictionary>)

export { filtersConfig, filtersDictionary }

export type { FilterName, FilterValue, FilterColor, FilterOption, Filter }
