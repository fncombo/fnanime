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

export type { AiringStatusKey, WatchingStatusKey, Score, WatchingStatus, AiringStatus, AnimeType, Anime }
