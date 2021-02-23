import { each } from 'async'
import Bottleneck from 'bottleneck'
import camelcaseKeys from 'camelcase-keys'
import { green, yellow } from 'chalk'
import { differenceInWeeks, fromUnixTime, getUnixTime, isValid } from 'date-fns'
import got from 'got'

import { MalAnime } from '../types'

import { closeDatabase, database } from './database'

interface ListSnapshot {
    id: string
    [key: string]: unknown
}

console.log('Updating individual anime details')

database
    .ref(process.env.MYANIMELIST_USERNAME)
    .once('value', async (listSnapshot) => {
        const currentDate = new Date()
        const limiter = new Bottleneck({ maxConcurrent: 1, minTime: 500 })
        const detailsDatabase = database.ref('details')
        const details = (await detailsDatabase.once('value')).val()

        each(Object.values(listSnapshot.val()) as ListSnapshot[], async ({ id }) => {
            const updatedAt = fromUnixTime(details?.[id]?.updatedAt)

            // Skip anime which have recently been updated
            if (isValid(updatedAt) && differenceInWeeks(currentDate, updatedAt) <= 2) {
                return
            }

            const data = await limiter.schedule(async () => {
                console.log('Getting details for anime ID', yellow(id))

                return (await got<MalAnime>(`https://api.jikan.moe/v3/anime/${id}`, { responseType: 'json' })).body
            })

            await detailsDatabase
                .child(id)
                .set({ ...camelcaseKeys(data, { deep: true }), updatedAt: getUnixTime(currentDate) })
        })

        console.log(green('Details of all anime saved to Firebase'))

        await closeDatabase()
    })
    .catch(async (error) => {
        await closeDatabase()

        throw error
    })
