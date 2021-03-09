import { red, yellow } from 'chalk'

import {
    AiringStatus,
    AiringStatusValues,
    AnimeType,
    AnimeTypeValues,
    AudioCodec,
    AudioCodecValues,
    Bits,
    BitsValues,
    Resolution,
    ResolutionValues,
    Score,
    ScoreValues,
    SeriesAnime,
    Source,
    SourceValues,
    VideoCodec,
    VideoCodecValues,
    WatchingStatus,
    WatchingStatusValues,
} from '../types'

import {
    AnimeDetailsData,
    AnimeListData,
    AnimeLocalData,
    AnimeSeriesData,
    MalDetailsAnime,
    MalListAnime,
} from './types'

type AssertType =
    | Resolution
    | Source
    | VideoCodec
    | Bits
    | AudioCodec
    | Score
    | AnimeType
    | WatchingStatus
    | AiringStatus

const airingStatusDictionary: Record<number, AiringStatus> = {
    1: 'Airing',
    2: 'Finished',
    3: 'Not Yet Aired',
}

const watchingStatusDictionary: Record<number, WatchingStatus> = {
    1: 'Watching',
    2: 'Completed',
    3: 'On-Hold',
    4: 'Dropped',
    // What is 5?
    6: 'Planned',
}

/**
 * Asserts that the given value is one of the allowed values for the specified type, otherwise an error is thrown.
 */
// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
function assertValue<T extends AssertType>(
    animeTitle: string,
    value: string | number,
    allowedValues: T[],
    name: string
): asserts value is T {
    if (!allowedValues.includes(value as T)) {
        throw new Error(red('Invalid', yellow(name), 'value of', yellow(value), 'for anime', yellow(animeTitle)))
    }
}

/**
 * Asserts that the given value is one of the allowed values for the specified type and returns it, otherwise an
 * error is thrown.
 */
const assertAndReturnValue = <T extends AssertType>(
    animeTitle: string,
    value: string | number,
    allowedValues: T[],
    name: string
): T => {
    assertValue<T>(animeTitle, value, allowedValues, name)

    return value
}

/**
 * Extracts the anime duration from its string and returns it in minutes. If the duration is unknown, 0 is returned.
 */
const getDuration = (duration: string): number => {
    if (!duration || duration === 'Unknown') {
        return 0
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

    return 0
}

/**
 * Returns the number of times this anime was rewatched from the tags.
 */
const getRewatched = (tags: string | null): number => {
    const regex = /re.*watched\s*:\s*(\d+)/i

    if (!tags || !regex.test(tags)) {
        return 0
    }

    const [, number] = regex.exec(tags) as string[]

    return parseInt(number, 10)
}

/**
 * Creates a partial anime data object from local data.
 */
const localAnimeDataFactory = ({
    title,
    release,
    resolution,
    source,
    videoCodec,
    bits,
    audioCodec,
    size,
}: {
    title: string
    release: string
    resolution: string
    source: string
    videoCodec: string
    bits: string
    audioCodec: string
    size: number
}): AnimeLocalData => ({
    release,
    resolution: assertAndReturnValue<Resolution>(title, parseInt(resolution, 10), ResolutionValues, 'resolution'),
    source: assertAndReturnValue<Source>(title, source, SourceValues, 'source'),
    videoCodec: assertAndReturnValue<VideoCodec>(title, videoCodec, VideoCodecValues, 'video codec'),
    bits: assertAndReturnValue<Bits>(title, parseInt(bits, 10), BitsValues, 'bits'),
    audioCodec: assertAndReturnValue<AudioCodec>(title, audioCodec, AudioCodecValues, 'audio codec'),
    size,
})

/**
 * Creates a partial anime data object from MyAnimeList data.
 */
const animeListDataFactory = ({
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
    tags,
}: MalListAnime): AnimeListData => ({
    id,
    title,
    score: assertAndReturnValue<Score>(title, score, ScoreValues, 'score'),
    image: imageUrl,
    airingStatus: assertAndReturnValue<AiringStatus>(
        title,
        airingStatusDictionary[airingStatus],
        AiringStatusValues,
        'airing status'
    ),
    totalEpisodes: totalEpisodes || 0,
    totalWatchedEpisodes: watchedEpisodes || 0,
    watchingStatus: assertAndReturnValue<WatchingStatus>(
        title,
        watchingStatusDictionary[watchingStatus],
        WatchingStatusValues,
        'watching status'
    ),
    type: assertAndReturnValue<AnimeType>(title, type, AnimeTypeValues, 'type'),
    url,
    rewatched: getRewatched(tags),
})

/**
 * Creates a partial anime data object from MyAnimeList details data.
 */
const animeDetailsDataFactory = ({
    titleEnglish,
    titleSynonyms,
    genres,
    studios = [],
    duration,
    episodes,
    score,
    rank,
}: MalDetailsAnime): AnimeDetailsData => {
    const data: AnimeDetailsData = {
        genres: genres
            .filter(({ type }) => type === 'anime')
            .map(({ name }) => name)
            .sort(),
        studios: studios.map(({ name }) => name).sort(),
        episodeDuration: getDuration(duration),
        totalDuration: getDuration(duration) * (episodes || 0),
    }

    // These have to be added individually so that Firebase doesn't complain about undefined keys
    if (titleEnglish) {
        data.englishTitle = titleEnglish
    }

    if (data.synonyms?.length) {
        data.synonyms = titleSynonyms
    }

    if (score) {
        data.meanScore = score
    }

    if (rank) {
        data.rank = rank
    }

    return data
}

/**
 * Takes an array of prequels or sequels for the given anime ID and recursively adds all the prequels/sequels for all
 * the anime to construct a full series overview.
 */
const getSeries = (
    type: 'prequel' | 'sequel',
    series: SeriesAnime[][],
    id: number,
    details: Record<string, MalDetailsAnime>
): void => {
    const currentSeries = details[id]?.related?.[type]
        // Only get anime, not manga
        ?.filter(({ type: currentSeriesType }) => currentSeriesType === 'anime')
        // Get only the ID and title
        .map(({ malId, name }) => ({
            id: malId,
            title: name,
        }))
        // Remove duplicates
        .filter(({ id: currentSeriesId }) =>
            series.every((innerSeries) =>
                innerSeries.every(({ id: innerSeriesId }) => innerSeriesId !== currentSeriesId)
            )
        )

    if (currentSeries?.length) {
        // Order correctly based on whether collecting prequels or sequels
        if (type === 'prequel') {
            series.unshift(currentSeries)
        } else {
            series.push(currentSeries)
        }

        for (const { id: currentSeriesId } of currentSeries) {
            getSeries(type, series, currentSeriesId, details)
        }
    }
}

/**
 * Returns an object with all prequels and sequels for the given anime ID.
 */
const seriesFactory = (id: number, details: Record<string, MalDetailsAnime>): AnimeSeriesData => {
    const prequels: SeriesAnime[][] = []
    const sequels: SeriesAnime[][] = []

    getSeries('prequel', prequels, id, details)

    getSeries('sequel', sequels, id, details)

    return { prequels, sequels }
}

export { localAnimeDataFactory, animeListDataFactory, animeDetailsDataFactory, seriesFactory }
