import { ReactNode } from 'react'

type AiringStatusKey = 1 | 2 | 3

type WatchingStatusKey = 1 | 2 | 3 | 4 | 6

type Score = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10

type WatchingStatus = 'Watching' | 'Completed' | 'On-Hold' | 'Dropped' | 'Planned'

type AiringStatus = 'Finished' | 'Airing' | 'Not Yet Aired'

type AnimeType = 'TV' | 'OVA' | 'Movie' | 'Special' | 'ONA' | 'Unknown'

type Source = 'BD' | 'TV' | 'Web' | 'DVD'

type VideoCodec = 'H.265' | 'H.264'

type Resolution = 360 | 480 | 576 | 720 | 1080

type Bits = 8 | 10 | 12

type AudioCodec = 'FLAC' | 'DTS' | 'AAC' | 'AC3' | 'Opus' | 'Other'

interface Anime {
    id: number
    title: string
    altTitle?: string
    url: string
    image: string
    airingStatus: AiringStatus
    episodeCount: number | '?'
    episodeDuration: number | null
    totalDuration: number | null
    watchingStatus: WatchingStatus
    watchedEpisodeCount: number
    totalWatchTime: number
    score: Score
    isFavorite: boolean
    type: AnimeType
    genres: string[]
    studios: string[]
    source?: Source
    release?: string
    videoCodec?: VideoCodec
    resolution?: Resolution
    bits?: Bits
    audioCodec?: AudioCodec
    size?: number
    isInCompareList?: 0 | 1
}

interface FilterOption<T extends keyof Anime> {
    label: ReactNode
    value: -1 | Anime[T]
    color?: 'green' | 'orange' | 'red' | 'blue'
    animeCount?: number
}

interface Filter<T extends keyof Anime> {
    key: T
    span?: number
    isAdvanced?: boolean
    isSelect?: boolean
    placeholder?: string
    options: FilterOption<T>[]
    filterValue?: string | number
}

interface FiltersConfigOption {
    label: ReactNode
    value: string | number
    color?: 'green' | 'orange' | 'red' | 'blue'
    animeCount?: number
}

interface FiltersConfig {
    key: keyof Anime
    span?: number
    isAdvanced?: boolean
    isSelect?: boolean
    placeholder?: string
    options: FiltersConfigOption[]
    filterValue?: string | number
}

type FilterOptions = Record<string | number, { label: ReactNode; color?: 'green' | 'orange' | 'red' | 'blue' }>

interface MalAnime {
    id: number
    addedToList: boolean
    airingStatus: AiringStatusKey
    days: number
    endDate: string | null
    hasEpisodeVideo: boolean
    hasPromoVideo: boolean
    hasVideo: boolean
    imageUrl: string
    isRewatching: boolean
    licensors: unknown[]
    malId: number
    priority: string
    rating: string
    score: Score
    seasonName: string | null
    seasonYear: string | null
    startDate: string | null
    storage: string | null
    studios: unknown[]
    tags: string | null
    title: string
    totalEpisodes: number
    type: AnimeType
    url: string
    videoUrl: string | null
    watchEndDate: string | null
    watchStartDate: string | null
    watchedEpisodes: number
    watchingStatus: WatchingStatusKey
}

interface MalDetails {
    malId: number
    url: string
    imageUrl: string
    trailerUrl: string
    title: string
    titleEnglish: string
    titleJapanese: string
    titleSynonyms: string[]
    type: string
    source: string
    episodes: number
    status: string
    airing: false
    aired: {
        from: string
        to: string
        prop: {
            from: {
                day: number
                month: number
                year: number
            }
            to: {
                day: number
                month: number
                year: number
            }
        }
        string: string
    }
    duration: string
    rating: string
    score: number
    scoredBy: number
    rank: number
    popularity: number
    members: number
    favorites: number
    synopsis: string
    background: string | null
    premiered: string
    broadcast: string
    related: {
        [key: string]: {
            malId: number
            type: string
            name: string
            url: string
        }[]
    }
    producers: {
        malId: number
        type: string
        name: string
        url: string
    }[]
    licensors: {
        malId: number
        type: string
        name: string
        url: string
    }[]
    studios: {
        malId: number
        type: string
        name: string
        url: string
    }[]
    genres: {
        malId: number
        type: string
        name: string
        url: string
    }[]
    openingThemes: string[]
    endingThemes: string[]
}

export type {
    MalAnime,
    MalDetails,
    AiringStatusKey,
    WatchingStatusKey,
    Score,
    WatchingStatus,
    AiringStatus,
    AnimeType,
    Anime,
    Filter,
    FilterOption,
    FilterOptions,
    FiltersConfig,
    FiltersConfigOption,
}
