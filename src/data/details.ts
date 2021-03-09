import { each } from 'async'
import Bottleneck from 'bottleneck'
import camelcaseKeys from 'camelcase-keys'
import { green, yellow } from 'chalk'
import { differenceInWeeks, fromUnixTime, getUnixTime, isValid } from 'date-fns'
import got from 'got'

import { closeDatabase, database } from './database'
import { MalDetailsAnime } from './types'

interface ListSnapshot {
    id: string
    [key: string]: unknown
}

console.log('Checking for outdated individual anime details...')

database
    .ref(process.env.MYANIMELIST_USERNAME)
    .once('value', async (listSnapshot) => {
        const currentDate = new Date()
        const limiter = new Bottleneck({ maxConcurrent: 1, minTime: 500 })
        const detailsDatabase = database.ref('details')
        const details = (await detailsDatabase.once('value')).val()

        let updatedDetails = 0

        await each(Object.values(listSnapshot.val()) as ListSnapshot[], async ({ id }) => {
            const updatedAt = fromUnixTime(details?.[id]?.updatedAt)

            // Skip anime which have recently been updated
            if (isValid(updatedAt) && differenceInWeeks(currentDate, updatedAt) <= 2) {
                return
            }

            updatedDetails += 1

            const { body } = await limiter.schedule(() => {
                console.log('Getting details for anime ID', yellow(id), '...')

                return got<MalDetailsAnime>(`https://api.jikan.moe/v3/anime/${id}`, {
                    responseType: 'json',
                })
            })

            await detailsDatabase.child(id).set({
                ...camelcaseKeys(body, { deep: true }),
                updatedAt: getUnixTime(currentDate),
            })
        })

        if (updatedDetails) {
            console.log(green('Updated details of', yellow(updatedDetails), 'anime saved to Firebase'))
        } else {
            console.log(green('No anime details needed to be updated'))
        }

        await closeDatabase()
    })
    .catch(async (error) => {
        await closeDatabase()

        throw error
    })
