import { green } from 'chalk'
import { getUnixTime } from 'date-fns'
import { remove as removeDiacritics } from 'diacritics'

import { Anime, MalAnime, MalDetails } from '../types'

import animeDetailsFactory from './animeDetailsFactory'
import animeListFactory from './animeListFactory'
import { closeDatabase, database } from './database'
import { encodeFirebaseKey } from './firebaseKey'

console.log('Getting all the necessary data')

const sanitizeAnimeTitle = (name: string): string => removeDiacritics(name.replace(/[√:?"]/g, '').replace(/[★/]/g, ' '))

Promise.all([
    database.ref(process.env.MYANIMELIST_USERNAME).once('value'),
    database.ref(process.env.MYANIMELIST_USERNAME_COMPARE).once('value'),
    database.ref('local').once('value'),
    database.ref('details').once('value'),
    database.ref('profile').once('value'),
])
    .then(async (promises) => {
        const [list, compareList, local, details, profile] = promises.map(
            (promise) => new Map(Object.entries(promise.val()))
        ) as [
            Map<string, MalAnime>,
            Map<string, MalAnime>,
            Map<string, Record<string, unknown>>,
            Map<string, MalDetails>,
            Map<string, Record<string, unknown>>
        ]

        const { anime: favorites } = profile.get('favorites') as { anime: MalAnime[] }

        await database.ref('data').set({
            anime: [...list.values()].map(
                (anime): Anime => {
                    const key = encodeFirebaseKey(sanitizeAnimeTitle(anime.title))
                    const id = `${anime.id}`

                    const data = {
                        ...animeListFactory(anime),
                        ...animeDetailsFactory(details.get(id) as MalDetails),
                        ...(local.has(key) ? local.get(key) : {}),
                        // Do not include this property if there is no compare list
                        ...(compareList.size ? { isInCompareList: compareList.has(id) ? 1 : (0 as 0 | 1) } : {}),
                        isFavorite: favorites.some(({ malId }) => malId === anime.id),
                    }

                    return {
                        ...data,
                        totalWatchTime: 1,
                    }
                }
            ),
            updatedAt: getUnixTime(new Date()),
        })

        console.log(green('Assembled data saved to Firebase'))

        await closeDatabase()
    })
    .catch(async (error) => {
        await closeDatabase()

        throw error
    })
