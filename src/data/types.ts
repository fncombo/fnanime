import { Anime } from '../types'

type AnimeLocalData = Pick<Anime, 'release' | 'resolution' | 'source' | 'videoCodec' | 'bits' | 'audioCodec' | 'size'>

type AnimeListData = Pick<
    Anime,
    | 'id'
    | 'title'
    | 'score'
    | 'image'
    | 'airingStatus'
    | 'totalEpisodes'
    | 'totalWatchedEpisodes'
    | 'watchingStatus'
    | 'type'
    | 'url'
    | 'totalRewatchedTimes'
    | 'isRewatching'
>

type AnimeDetailsData = Pick<
    Anime,
    | 'englishTitle'
    | 'synonyms'
    | 'genres'
    | 'studios'
    | 'episodeDuration'
    | 'totalDuration'
    | 'meanScore'
    | 'rank'
    | 'related'
>

type AnimeSeriesData = Pick<Anime, 'prequels' | 'sequels'>

interface Relation {
    malId: number
    name: string
    type: 'anime' | 'manga'
    url: string
}

interface MalDetailsAnime {
    aired: {
        from: string
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
        to: string
    }
    airing: boolean
    background: string
    broadcast: string
    duration: string
    endingThemes: string[]
    episodes: number
    favorites: number
    genres: Relation[]
    imageUrl: string
    licensors: Relation[]
    malId: number
    members: number
    openingThemes: string[]
    popularity: number
    premiered: string
    producers: Relation[]
    rank: number
    rating: string
    related?: {
        [key: string]: Relation[]
    }
    score: number
    scoredBy: number
    source: string
    status: string
    studios?: Relation[]
    synopsis: string
    titleEnglish?: string
    titleJapanese: string
    titleSynonyms?: string[]
    title: string
    trailerUrl: string
    type: string
    url: string
}

interface MalListAnime {
    addedToList: boolean
    airingStatus: number
    days: number | null
    endDate: Date | null
    hasEpisodeVideo: boolean
    hasPromoVideo: boolean
    hasVideo: boolean
    imageUrl: string
    id: number
    isRewatching: boolean
    malId: number
    priority: string
    rating: string
    score: number
    seasonSame: string
    seasonYear: number
    startDate: Date
    storage: null
    tags: string | null
    title: string
    totalEpisodes: number
    type: 'Movie' | 'ONA' | 'OVA' | 'Special' | 'TV' | 'Unknown'
    url: string
    videoUrl: string
    watchEndDate: Date | null
    watchStartDate: Date | null
    watchedEpisodes: number
    watchingStatus: number
}

interface Profile {
    favorites: {
        anime: MalListAnime[]
    }
}

export type { AnimeLocalData, AnimeListData, AnimeDetailsData, AnimeSeriesData, MalListAnime, MalDetailsAnime, Profile }
