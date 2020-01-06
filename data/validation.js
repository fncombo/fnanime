/* eslint-disable camelcase, max-len */

// ffprobe configuration, make sure the binary is in the same directory as this file
process.env.FFPROBE_PATH = './ffprobe'

// Node
const { unlinkSync } = require('fs')
const { readdir } = require('fs').promises

// Libraries
const has = require('has')
const ffprobe = require('ffprobe-client')
const log4js = require('log4js')

// Delete the current log file
try {
    unlinkSync('./validation.log')
} catch (error) {
    // No log yet *shrug*
}

// Configure logging
log4js.configure({
    appenders: {
        validation: {
            type: 'dateFile',
            filename: 'validation.log',
        },
    },
    categories: {
        default: {
            appenders: [ 'validation' ],
            level: 'debug',
        },
    },
})

// Create the logger
const log = log4js.getLogger('validation')

// Map ffprobe video codecs to mine
const VIDEO_CODEC_MAP = {
    hevc: 'H.265',
    h264: 'H.264',
}

// Map ffprobe audio codecs to mine
const AUDIO_CODEC_MAP = {
    flac: 'FLAC',
    dts: 'DTS',
    aac: 'AAC',
    ac3: 'AC3',
    opus: 'Opus',
    vorbis: 'Other',
    mp3: 'Other',
}

// Array of valid subtitle formats to check for
const VALID_SUBTITLES = [
    'ass',
    'subrip',
]

/**
 * Logs a generic mismatch of configured vs actual data for an anime.
 */
function logMismatch(what, animeTitle, configured, actual) {
    log.warn(`${what} mismatch for anime "${animeTitle}". Configured: "${configured}". Actual: "${actual}"`)
}

/**
 * Validates a single video stream to ensure it has correct format.
 */
function validateVideoStream(stream, anime) {
    // Wrong codec
    if (VIDEO_CODEC_MAP[stream.codec_name] !== anime.videoCodec) {
        logMismatch('Video codec', anime.title, anime.videoCodec, stream.codec_name)
    }

    // Wrong resolution, forgive "close enough" resolutions because not all files are 100% perfect
    if (anime.resolution !== stream.height) {
        if (anime.resolution === 1080 && stream.height !== 1080 && stream.height > 800) {
            log.info(`Non-precise 1080p resolution for anime "${anime.title}"`)
        } else if (anime.resolution === 720 && stream.height !== 720 && stream.height > 600 && stream.height < 800) {
            log.info(`Non-precise 720p resolution for anime "${anime.title}"`)
        } else if (anime.resolution === 480 && stream.height !== 480 && stream.height > 400 && stream.height < 600) {
            log.info(`Non-precise 480p resolution for anime "${anime.title}"`)
        } else {
            logMismatch('Resolution', anime.title, anime.resolution, stream.height)
        }
    }

    // Wrong bits, if any data about them is available
    if (!has(stream, 'bits_per_raw_sample')) {
        log.info(`No bits information found for anime "${anime.title}"`)
    } else if (anime.bits !== parseInt(stream.bits_per_raw_sample, 10)) {
        logMismatch('Bits', anime.title, anime.bits, stream.bits_per_raw_sample)
    }
}

/**
 * Validates all audio streams to ensure there is Japanese language audio and it has the correct format.
 */
function validateAudioStreams(streams, anime) {
    // Whether a Japanese audio stream was found and it matched to the configured codec
    let hasJp = false
    let hasMatchedJp = false

    // Go through each audio stream
    for (const stream of streams) {
        // Ensure that there is a Japanese language track
        if (has(stream, 'tags') && has(stream.tags, 'language')) {
            // Ignore commentary streams
            if (has(stream.tags, 'title') && /comment/i.test(stream.tags.title)) {
                continue
            }

            if (stream.tags.language === 'jpn') {
                hasJp = true

                // Ensure that the Japanese audio matches configured codec
                if (AUDIO_CODEC_MAP[stream.codec_name] === anime.audioCodec) {
                    hasMatchedJp = true

                // Otherwise create an array of all codecs found for Japanese audio streams to display in the error
                } else if (Array.isArray(hasMatchedJp)) {
                    hasMatchedJp.push(stream.codec_name)
                } else if (hasMatchedJp === false) {
                    hasMatchedJp = [ stream.codec_name ]
                }
            }

        // Only warn about missing language tag when there are more than 1 audio streams,
        // sometimes for only 1 stream, the language is not specified because it's obvious
        } else if (streams.length > 1) {
            log.warn(`No audio language tags found on an audio stream for anime "${anime.title}"`)
        }
    }

    // Only warn about missing Japanese audio stream when there are more than 1 audio streams,
    // sometimes for only 1 stream, the language is not specified because it's obvious
    if (!hasJp && streams.length > 1) {
        log.warn(`No Japanese audio found for anime "${anime.title}"`)
    }

    // If Japanese audio stream codec does not match the configured codec
    if (hasJp && Array.isArray(hasMatchedJp)) {
        logMismatch('Audio codec for Japanese audio', anime.title, anime.audioCodec, hasMatchedJp.join(', '))
    }
}

/**
 * Validates all subtitle streams to ensure there are proper English subtitles.
 */
function validateSubtitleStreams(streams, anime) {
    // Whether proper English subtitles were found and they are of valid format
    let hasEng = false
    let isEngValidFormat = false

    // Go through each subtitle stream
    for (const stream of streams) {
        // Ensure that there are English subtitles
        if (has(stream, 'tags')) {
            if (has(stream.tags, 'title')) {
                // Ignore only sign and/or song subtitles
                if (/(?:sign|song)/i.test(stream.tags.title)) {
                    continue
                }

                // Ignore only OP/ED subtitles
                if (/(?:OP|ED)/.test(stream.tags.title)) {
                    continue
                }
            }

            // Check that the subtitles are tagged as English or Japanese, because for some reason sometimes
            // English subtitles are tagged as [jpn] language
            if (has(stream.tags, 'language') && (stream.tags.language === 'eng' || stream.tags.language === 'jpn')) {
                hasEng = true

                // Endure that these subtitles are of valid format
                if (VALID_SUBTITLES.includes(stream.codec_name)) {
                    isEngValidFormat = true
                }
            }

        // Only warn about missing language tag when there are more than 1 subtitle streams,
        // sometimes for only 1 stream, the language is not specified because it's obvious
        } else if (streams.length > 1) {
            log.warn(`No subtitle language tags found on a subtitle stream for anime "${anime.title}"`)
        }
    }

    // Only warn about missing English subtitles when there are more than 1 subtitle streams,
    // sometimes for only 1 stream, the language is not specified because it's obvious
    if (!hasEng && streams.length > 1) {
        log.warn(`No English subtitles found for anime "${anime.title}"`)
    }

    // If English subtitles were found but they are not of valid format
    if (hasEng && !isEngValidFormat) {
        log.warn(`English subtitles are not ASS format for anime "${anime.title}"`)
    }
}

/**
 * Validates an anime by using ffprobe to get data about the video, audio, and subtitles contained within the file.
 */
async function validateLocalData(path, isDirectory, anime) {
    // The file to probe
    let probeFilePath

    // If given an anime directory, find the first valid file to probe
    // TODO: recursively check sub-directories if no file found in the root of the anime folder
    // (e.g. all .mkv files are divided in season folders)
    if (isDirectory) {
        // Get all contents of the folder
        let contents

        try {
            contents = await readdir(path, { withFileTypes: true })
        } catch (error) {
            log.error(`Could not read folder contents for anime "${anime.title}"`)
        }

        // Find the first probe-able file
        const probeFile = contents.find(content => {
            // Ignore just opening and ending files
            if (/((?:NC)?(?:OP|ED)(?:\s\d+|\d+)?)(?!\w*\]|(?:\s?-))/.test(content.name)) {
                return false
            }

            // Ignore not .mkv files
            if (!/\.mkv$/.test(content.name)) {
                return false
            }

            return true
        })

        // For any reason this file doesn't have a name?
        if (!probeFile || !has(probeFile, 'name')) {
            log.fatal(`Could not find a file to probe for anime "${anime.title}"`)

            return
        }

        probeFilePath = `${path}/${probeFile.name}`
    } else {
        probeFilePath = path
    }

    // Probe the .mkv file
    let probeData

    try {
        probeData = await ffprobe(probeFilePath)
    } catch (error) {
        log.fatal(`Could not probe file ${probeFilePath}`)
    }

    // Couldn't probe
    if (!probeData) {
        return
    }

    // Returned no probe data
    if (!has(probeData, 'streams')) {
        log.fatal(`Could not find any streams for file ${probeFilePath}`)

        return
    }

    // Get the unique streams and validate them
    const { streams } = probeData

    const videoStream = streams.find(({ codec_type }) => codec_type === 'video')
    const audioStreams = streams.filter(({ codec_type }) => codec_type === 'audio')
    const subtitleStreams = streams.filter(({ codec_type }) => codec_type === 'subtitle')

    validateVideoStream(videoStream, anime)

    validateAudioStreams(audioStreams, anime)

    validateSubtitleStreams(subtitleStreams, anime)
}

// Exports
module.exports = {
    validateLocalData,
}
