type Score = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10

const ScoreValues: Score[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

type WatchingStatus = 'Watching' | 'Completed' | 'On-Hold' | 'Dropped' | 'Planned'

const WatchingStatusValues: WatchingStatus[] = ['Watching', 'Completed', 'On-Hold', 'Dropped', 'Planned']

type AiringStatus = 'Finished' | 'Airing' | 'Not Yet Aired'

const AiringStatusValues: AiringStatus[] = ['Finished', 'Airing', 'Not Yet Aired']

type AnimeType = 'TV' | 'OVA' | 'Movie' | 'Special' | 'ONA' | 'Unknown'

const AnimeTypeValues: AnimeType[] = ['TV', 'OVA', 'Movie', 'Special', 'ONA', 'Unknown']

type Source = 'BD' | 'TV' | 'Web' | 'DVD'

const SourceValues: Source[] = ['BD', 'TV', 'Web', 'DVD']

type VideoCodec = 'H.265' | 'H.264'

const VideoCodecValues: VideoCodec[] = ['H.265', 'H.264']

type Resolution = 360 | 480 | 576 | 720 | 1080

const ResolutionValues: Resolution[] = [360, 480, 576, 720, 1080]

type Bits = 8 | 10 | 12

const BitsValues: Bits[] = [8, 10, 12]

type AudioCodec = 'FLAC' | 'DTS' | 'AAC' | 'AC3' | 'Opus' | 'Other'

const AudioCodecValues: AudioCodec[] = ['FLAC', 'DTS', 'AAC', 'AC3', 'Opus', 'Other']

interface RelatedAnime {
    id: number
    title?: string
}

interface RelatedAnimeByType {
    type: string
    anime: RelatedAnime[]
}

interface Anime {
    id: number
    title: string
    englishTitle?: string
    synonyms?: string[]
    url: string
    image: string
    airingStatus: AiringStatus
    totalEpisodes: number
    episodeDuration: number
    totalDuration: number
    watchingStatus: WatchingStatus
    totalWatchedEpisodes: number
    totalWatchTime: number
    isRewatching: boolean
    totalRewatchedTimes: number
    score: Score
    meanScore?: number
    rank?: number
    isFavorite: boolean
    type: AnimeType
    genres?: string[]
    studios?: string[]
    source?: Source
    release?: string
    videoCodec?: VideoCodec
    resolution?: Resolution
    bits?: Bits
    audioCodec?: AudioCodec
    size?: number
    isInCompareList?: 0 | 1
    prequels?: RelatedAnime[][]
    sequels?: RelatedAnime[][]
    related?: RelatedAnimeByType[]
}

export {
    ScoreValues,
    WatchingStatusValues,
    AiringStatusValues,
    AnimeTypeValues,
    SourceValues,
    VideoCodecValues,
    ResolutionValues,
    BitsValues,
    AudioCodecValues,
}

export type {
    Score,
    WatchingStatus,
    AiringStatus,
    AnimeType,
    Source,
    VideoCodec,
    Resolution,
    Bits,
    AudioCodec,
    RelatedAnime,
    RelatedAnimeByType,
    Anime,
}
