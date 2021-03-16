import { red, yellow } from 'chalk'
import { sentenceCase } from 'change-case'

import {
    AiringStatus,
    AiringStatusValues,
    AnimeType,
    AnimeTypeValues,
    AudioCodec,
    AudioCodecValues,
    Bits,
    BitsValues,
    RelatedAnime,
    RelatedAnimeByType,
    Resolution,
    ResolutionValues,
    Score,
    ScoreValues,
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
function assert<T extends AssertType>(
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
 * Validates that the given value is one of the allowed values for the specified type and returns it,
 * otherwise an error is thrown.
 */
const validate = <T extends AssertType>(
    animeTitle: string,
    value: string | number,
    allowedValues: T[],
    name: string
): T => {
    assert<T>(animeTitle, value, allowedValues, name)

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
const getTotalRewatchedTimes = (tags: string | null): number => {
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
    resolution: validate<Resolution>(title, parseInt(resolution, 10), ResolutionValues, 'resolution'),
    source: validate<Source>(title, source, SourceValues, 'source'),
    videoCodec: validate<VideoCodec>(title, videoCodec, VideoCodecValues, 'video codec'),
    bits: validate<Bits>(title, parseInt(bits, 10), BitsValues, 'bits'),
    audioCodec: validate<AudioCodec>(title, audioCodec, AudioCodecValues, 'audio codec'),
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
    isRewatching,
}: MalListAnime): AnimeListData => ({
    id,
    title,
    score: validate<Score>(title, score, ScoreValues, 'score'),
    image: imageUrl,
    airingStatus: validate<AiringStatus>(
        title,
        airingStatusDictionary[airingStatus],
        AiringStatusValues,
        'airing status'
    ),
    totalEpisodes: totalEpisodes || 0,
    totalWatchedEpisodes: watchedEpisodes || 0,
    watchingStatus: validate<WatchingStatus>(
        title,
        isRewatching ? 'Watching' : watchingStatusDictionary[watchingStatus],
        WatchingStatusValues,
        'watching status'
    ),
    type: validate<AnimeType>(title, type, AnimeTypeValues, 'type'),
    url,
    isRewatching,
    totalRewatchedTimes: getTotalRewatchedTimes(tags),
})

/**
 * Creates a partial anime data object from MyAnimeList details data.
 */
const animeDetailsDataFactory = (
    {
        titleEnglish,
        titleSynonyms,
        genres = [],
        studios = [],
        duration,
        episodes,
        score,
        rank,
        related,
    }: MalDetailsAnime,
    details: Record<string, MalDetailsAnime>
): AnimeDetailsData => {
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

    if (related && Object.values(related).length) {
        data.related = Object.values(
            Object.entries(related).reduce((accumulator, [relationType, relatedItems]) => {
                if (relationType === 'sequel' || relationType === 'prequel') {
                    return accumulator
                }

                for (const relatedItem of relatedItems) {
                    if (relatedItem.type === 'anime') {
                        const relationData: RelatedAnime = {
                            id: relatedItem.malId,
                        }

                        if (!details[relatedItem.malId]) {
                            relationData.title = relatedItem.name
                        }

                        if (!accumulator[relationType]) {
                            accumulator[relationType] = {
                                type: sentenceCase(relationType),
                                anime: [],
                            }

                            console.log(sentenceCase(relationType))
                        }

                        accumulator[relationType].anime.push(relationData)
                    }
                }

                return accumulator
            }, {} as Record<string, RelatedAnimeByType>)
        )
    }

    return data
}

/**
 * Takes an array of prequels or sequels for the given anime ID and recursively adds all the prequels/sequels for all
 * the anime to construct a full series overview.
 */
const getSeries = (
    type: 'prequel' | 'sequel',
    series: RelatedAnime[][],
    id: number,
    details: Record<string, MalDetailsAnime>
): void => {
    const currentSeries = details[id]?.related?.[type]
        // Only get anime, not manga
        ?.filter(({ type: currentSeriesType }) => currentSeriesType === 'anime')
        // Get only the ID, and the title of the anime if it's not in details
        .map(({ malId, name }) => {
            const data: RelatedAnime = {
                id: malId,
            }

            if (!details[malId]) {
                data.title = name
            }

            return data
        })
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
    const prequels: RelatedAnime[][] = []
    const sequels: RelatedAnime[][] = []

    getSeries('prequel', prequels, id, details)

    getSeries('sequel', sequels, id, details)

    return { prequels, sequels }
}

export { localAnimeDataFactory, animeListDataFactory, animeDetailsDataFactory, seriesFactory }
