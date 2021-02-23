import { AiringStatus, AiringStatusKey, AnimeType, Score, WatchingStatus, WatchingStatusKey } from '../types'

interface AnimeListData {
    id: number
    title: string
    score: Score
    image: string
    airingStatus: AiringStatus
    episodeCount: number | '?'
    watchedEpisodeCount: number
    watchingStatus: WatchingStatus
    type: AnimeType
    url: string
}

const airingStatusLookup: Record<AiringStatusKey, AiringStatus> = {
    1: 'Airing',
    2: 'Finished',
    3: 'Not Yet Aired',
}

const watchingStatusLookup: Record<WatchingStatusKey, WatchingStatus> = {
    1: 'Watching',
    2: 'Completed',
    3: 'On-Hold',
    4: 'Dropped',
    // What is 5?
    6: 'Planned',
}

/**
 * Creates as anime object from MyAnimeList data.
 */
const animeListFactory = ({
    id,
    title,
    score,
    imageUrl,
    airingStatus,
    totalEpisodes,
    watchedEpisodes,
    watchingStatus,
    type,
    url,
}: {
    id: number
    title: string
    score: Score
    imageUrl: string
    airingStatus: AiringStatusKey
    totalEpisodes: number
    watchedEpisodes: number
    watchingStatus: WatchingStatusKey
    type: AnimeType
    url: string
}): AnimeListData => ({
    id,
    title,
    score,
    image: imageUrl,
    airingStatus: airingStatusLookup[airingStatus],
    episodeCount: totalEpisodes > 0 ? totalEpisodes : '?',
    watchedEpisodeCount: watchedEpisodes || 0,
    watchingStatus: watchingStatusLookup[watchingStatus],
    type,
    url,
})

export default animeListFactory
