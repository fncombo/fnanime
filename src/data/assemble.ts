import { green } from 'chalk'
import { getUnixTime } from 'date-fns'
import { remove as removeDiacritics } from 'diacritics'

import { Anime } from '../types'

import { closeDatabase, database, encodeFirebaseKey } from './database'
import { animeDetailsDataFactory, animeListDataFactory, seriesFactory } from './factories'
import { AnimeLocalData, MalDetailsAnime, MalListAnime, Profile } from './types'

console.log('Getting all the necessary data for assembling...')

/**
 * Sanitizes an anime title from MyAnimeList so that it matches the anime title saved locally.
 */
const sanitizeAnimeTitle = (name: string) => removeDiacritics(name.replace(/[√:?"]/g, '').replace(/[★/]/g, ' '))

Promise.all([
    database.ref(process.env.MYANIMELIST_USERNAME).once('value'),
    database.ref(process.env.MYANIMELIST_USERNAME_COMPARE).once('value'),
    database.ref('local').once('value'),
    database.ref('details').once('value'),
    database.ref('profile').once('value'),
])
    .then(async (promises) => {
        const [list, compareList, local, details, profile] = promises.map((promise) => promise.val()) as [
            Record<string, MalListAnime>,
            Record<string, MalListAnime>,
            Record<string, AnimeLocalData>,
            Record<string, MalDetailsAnime>,
            Profile
        ]

        const data = Object.values(list).map(
            (anime): Anime => {
                const stringId = anime.id.toString()

                const listData = animeListDataFactory(anime)
                const detailsData = animeDetailsDataFactory(details[stringId])

                const { totalWatchedEpisodes, rewatched } = listData
                const { episodeDuration } = detailsData

                return {
                    ...listData,
                    ...detailsData,
                    // Only include local data if it exists for the anime
                    ...(local[encodeFirebaseKey(sanitizeAnimeTitle(anime.title))] || {}),
                    // Do not include this property if there is no compare list
                    ...(Object.keys(compareList).length ? { isInCompareList: compareList[stringId] ? 1 : 0 } : {}),
                    ...seriesFactory(anime.id, details),
                    isFavorite: profile.favorites.anime.some(({ malId }) => malId === anime.id),
                    totalWatchTime: totalWatchedEpisodes * episodeDuration * (rewatched + 1),
                    related: [],
                }
            }
        )

        await database.ref('data').set({
            anime: data,
            updatedAt: getUnixTime(new Date()),
        })

        console.log(green('Assembled data saved to Firebase'))

        await closeDatabase()
    })
    .catch(async (error) => {
        await closeDatabase()

        throw error
    })
