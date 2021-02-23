interface AnimeDetailsData {
    altTitle: string
    genres: string[]
    studios: string[]
    episodeDuration: number | null
    totalDuration: number | null
}

/**
 * TODO: ...
 */
const getDuration = (duration: string): number | null => {
    if (!duration || duration === 'Unknown') {
        return null
    }

    // Convert hours into minutes
    if (/hr/i.test(duration)) {
        const [, hours, minutes] = /(\d+)\s?hr\.?\s?(\d+)?/i.exec(duration) as string[]

        return parseInt(hours, 10) * 60 + (minutes ? parseInt(minutes, 10) : 0)
    }

    if (/\d+/.test(duration)) {
        const [minutes] = /\d+/.exec(duration) as string[]

        return parseInt(minutes, 10)
    }

    return null
}

/**
 * TODO: ...
 */
const animeDetailsFactory = ({
    titleEnglish = '',
    genres = [],
    studios = [],
    duration,
    episodes,
}: {
    titleEnglish: string
    genres: {
        type: string
        name: string
    }[]
    studios: {
        name: string
    }[]
    duration: string
    episodes: number
}): AnimeDetailsData => ({
    altTitle: titleEnglish,
    genres: genres
        .filter(({ type }) => type === 'anime')
        .map(({ name }) => name)
        .sort(),
    studios: studios.map(({ name }) => name).sort(),
    episodeDuration: getDuration(duration),
    totalDuration: episodes ? (getDuration(duration) as number) * episodes : null,
})

export default animeDetailsFactory
