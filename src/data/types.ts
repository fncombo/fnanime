interface MalAnime {
    id: number
    addedToList: boolean
    airingStatus: number
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
    score: number
    seasonName: string | null
    seasonYear: string | null
    startDate: string | null
    storage: string | null
    studios: unknown[]
    tags: string | null
    title: string
    totalEpisodes: number
    type: string
    url: string
    videoUrl: string | null
    watchEndDate: string | null
    watchStartDate: string | null
    watchedEpisodes: number
    watchingStatus: number
}

export type { MalAnime }
