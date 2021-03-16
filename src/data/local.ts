import { eachSeries } from 'async'
import { green, red, white, yellow } from 'chalk'
import { promises as fs } from 'fs'
import getFolderSizeCallback from 'get-folder-size'
import path from 'path'
import { stdout as singleLineLog } from 'single-line-log'
import { promisify } from 'util'

import { closeDatabase, database, encodeFirebaseKey } from './database'
import { localAnimeDataFactory } from './factories'
import { AnimeLocalData } from './types'

const getFolderSize = promisify<string, number>(getFolderSizeCallback)
const directories = process.env.DIRECTORIES?.split(',') || []
const anime: Record<string, AnimeLocalData> = {}
const infoRegex = /(.+)\s\[(.*)\]\[(\d+p)\s(\w+)\s(H\.\d+)\s(\d+bit)\s(\w+)\]/

let processedDirectories = 0

/**
 * Simple way to normalize a release name for duplicate search.
 */
const normalizeString = (string: string): string => string.toLowerCase().replace(/[^\w\d]/g, '')

eachSeries(directories, async (directory) => {
    // Skip directories which don't exist
    try {
        await fs.stat(directory)
    } catch (error) {
        console.log('Directory', yellow(directory), 'not found, skipping')

        return
    }

    processedDirectories += 1

    // Get everything in the directory and filter out unwanted entries
    const entries = (await fs.readdir(directory, { withFileTypes: true })).filter(({ name }) => !/\.ini/.test(name))

    await eachSeries(entries, async (entry) => {
        const { name } = entry

        // Anime cannot be matched against the regex because it is named incorrectly
        if (!infoRegex.test(name)) {
            throw new Error(red('Folder or file name for anime', yellow(name), 'is invalid'))
        }

        const count = `${yellow(entries.indexOf(entry) + 1)}/${yellow(entries.length)}`

        singleLineLog(`Getting the total size of ${count} anime from ${yellow(directory)}`)

        const [, title, release, resolution, source, videoCodec, bits, audioCodec] = infoRegex.exec(name) as string[]

        const encodedTitle = encodeFirebaseKey(title)

        // Anime found multiple times
        if (anime[encodedTitle]) {
            throw new Error(red('Anime', yellow(title), 'was found multiple times'))
        }

        const size = entry.isDirectory()
            ? await getFolderSize(path.join(directory, name))
            : (await fs.stat(path.join(directory, name))).size

        anime[encodedTitle] = localAnimeDataFactory({
            title,
            release,
            resolution,
            source,
            videoCodec,
            bits,
            audioCodec,
            size,
        })

        // Make sure all release names are consistent (case, spacing, symbols, etc.)
        const releaseNamingMismatch = Object.entries(anime).find(
            ([, { release: animeRelease = '' }]) =>
                animeRelease !== release && normalizeString(animeRelease) === normalizeString(release)
        )

        if (releaseNamingMismatch) {
            throw new Error(
                red(
                    'Release name mismatch found between',
                    white(decodeURIComponent(releaseNamingMismatch[0])),
                    yellow(`[${releaseNamingMismatch[1].release}]`),
                    'and',
                    white(title),
                    yellow(`[${release}]`)
                )
            )
        }
    })

    // Empty log required to separate single line logs
    console.log()
})
    .then(async () => {
        // TODO: Make sure all anime are saved in the correct folders based on their types

        // If some directories were not found, just update the local data, otherwise completely overwrite it
        if (processedDirectories === directories.length) {
            console.log(green('All directories processed successfully, overwriting all local data in Firebase...'))

            await database.ref('local').set(anime)
        } else {
            console.log(green('Only some directories processed, updating some local data in Firebase...'))

            await database.ref('local').update(anime)
        }

        console.log(green('Local anime data saved to Firebase'))

        await closeDatabase()
    })
    .catch(async ({ message }) => {
        console.log()

        await closeDatabase()

        console.log(message)
    })
