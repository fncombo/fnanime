import { eachSeries } from 'async'
import camelcaseKeys from 'camelcase-keys'
import { green, yellow } from 'chalk'
import got from 'got'

import { MalAnime } from '../types'

import { closeDatabase, database } from './database'

const getAllAnime = async (username: string): Promise<MalAnime[]> =>
    got.paginate.all<MalAnime>(`https://api.jikan.moe/v3/user/${username}/animelist/all`, {
        searchParams: { page: 1 },
        pagination: {
            transform: (response) => typeof response.body === 'string' && JSON.parse(response.body).anime,
            paginate: (response, _, currentItems) => {
                // Attempt to get the next page when the current page has the maximum number of anime
                if (currentItems.length >= 300) {
                    return {
                        searchParams: {
                            page: parseInt(response.request.options.searchParams?.get('page') as string, 10) + 1,
                        },
                    }
                }

                // No more pages
                return false
            },
        },
    })

eachSeries([process.env.MYANIMELIST_USERNAME, process.env.MYANIMELIST_USERNAME_COMPARE], async (username) => {
    // Skip undefined usernames
    if (!username) {
        return
    }

    console.log('Getting MyAnimeList of', yellow(username))

    const anime = (await getAllAnime(username))
        // Convert all object keys to camel case as the API returns them in snake case
        .map((object) => camelcaseKeys(object, { deep: true }))
        // Add additional property for the ID
        .map((object) => ({ ...object, id: object.malId }))
        // Convert into an object with each anime's ID as the key
        .reduce((accumulator, entry) => ({ ...accumulator, [entry.id]: entry }), {} as Record<number, MalAnime>)

    console.log('Saving MyAnimeList of', yellow(username), 'to Firebase')

    await database.ref(username).set(anime)

    console.log(green('MyAnimeList data of', yellow(username), 'saved to Firebase'))

    if (username === process.env.MYANIMELIST_USERNAME) {
        console.log('Getting profile of', yellow(username))

        const { body } = await got(`https://api.jikan.moe/v3/user/${username}`)

        console.log('Saving profile of', yellow(username), 'to Firebase')

        await database.ref('profile').set(camelcaseKeys(JSON.parse(body), { deep: true }))

        console.log(green('Profile of', yellow(username), 'saved to Firebase'))
    }
})
    .then(closeDatabase)
    .catch(async (error) => {
        await closeDatabase()

        throw error
    })
