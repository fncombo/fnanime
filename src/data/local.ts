import { eachSeries } from 'async'
import { green, red, yellow } from 'chalk'
import fs from 'fs'
import getFolderSizeCallback from 'get-folder-size'
import path from 'path'
import { stdout as singleLineLog } from 'single-line-log'
import { promisify } from 'util'

import { filtersDictionary } from '../filters/config'
import { Anime } from '../types'

import { closeDatabase, database } from './database'
import { encodeFirebaseKey } from './firebaseKey'

const { readdir, stat } = fs.promises
const getFolderSize = promisify(getFolderSizeCallback)
const directories = process.env.DIRECTORIES as string

const anime = new Map()
const infoRegex = /(.+)\s\[(.*)\]\[(\d+p)\s(\w+)\s(H\.\d+)\s(\d+bit)\s(\w+)\]/

/**
 * TODO: ...
 */
const validateType = <T extends string | number>(title: string) => (value: T, type: keyof Anime): T => {
    if (!filtersDictionary[type][value]) {
        console.log(red('Invalid value', yellow(value), 'for type', yellow(type), 'for anime', yellow(title)))

        throw new Error('Validation')
    }

    return value
}

eachSeries(directories.split(','), async (directory) => {
    // Get everything in the directory and filter out unwanted files
    const entries = (await readdir(directory, { withFileTypes: true })).filter((entry) => !/\.ini/.test(entry.name))

    await eachSeries(entries, async (entry) => {
        // Anime cannot be matched against the regex because it is named incorrectly
        if (!infoRegex.test(entry.name)) {
            console.log(red('Folder or file name for anime', yellow(entry.name), 'is invalid'))

            throw new Error('Validation')
        }

        const count = `${yellow(entries.indexOf(entry) + 1)}/${yellow(entries.length)}`

        singleLineLog(`Getting the total size of ${count} anime from ${yellow(directory)}\n`)

        const [, title, release, resolution, source, codec, bits, audio] = infoRegex.exec(entry.name) as string[]
        const fullPath = path.join(directory, entry.name)
        const size = entry.isDirectory() ? await getFolderSize(fullPath) : (await stat(fullPath)).size

        // Anime found multiple times in different folders
        if (anime.has(title)) {
            console.log(red('Anime', yellow(title), 'exists more than once'))

            throw new Error('Validation')
        }

        const validate = validateType(title)

        anime.set(encodeFirebaseKey(title), {
            release,
            resolution: validate(parseInt(resolution, 10), 'resolution'),
            source: validate(source, 'source'),
            videoCodec: validate(codec, 'videoCodec'),
            bits: validate(parseInt(bits, 10), 'bits'),
            audioCodec: validate(audio, 'audioCodec'),
            size,
        })
    })

    console.log('All directories processed')
})
    .then(async () => {
        // TODO: Make sure all release names are consistent and unique

        // TODO: Make sure all anime are saved in the correct folders based on their type

        console.log('Saving local anime data to Firebase')

        await database.ref('local').set(Object.fromEntries(anime))

        console.log(green('Local anime data saved to Firebase'))

        await closeDatabase()
    })
    .catch(async (error) => {
        await closeDatabase()

        if (error.message !== 'Validation') {
            throw error
        }
    })
