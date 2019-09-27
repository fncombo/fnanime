// Libraries
const has = require('has')

// Valid values for different types of data
const TYPES = {
    resolution: [ 1080, 720, 576, 480, 360 ],
    source: [ 'BD', 'TV', 'Web', 'DVD' ],
    videoCodec: [ 'H.265', 'H.264' ],
    audioCodec: [ 'FLAC', 'DTS', 'AAC', 'AC3' ],
    bits: [ 10, 8 ],
}

/**
 * Checks whether a given type has a valid value.
 */
function validateType(type, value, animeTitle) {
    if (!has(TYPES, type)) {
        throw new Error(`Trying to validate an unknown type "${type}"`)
    }

    if (!value || !value.length) {
        throw new Error(`Trying to validate an empty type "${type}" value "${type}" for anime "${animeTitle}`)
    }

    if (!TYPES[type].includes(value)) {
        throw new Error(`Unknown value "${value}" for type "${type}"`)
    }
}

/**
 * Replace or remove characters which cannot be used in folder and file names.
 */
function removeInvalidChars(string) {
    return string.replace(/[√:?]/g, '').replace(/[★/]/g, ' ')
}

/**
 * Get the rewatch count from the anime's tags.
 */
function getRewatchCount(tags) {
    if (!tags) {
        return 0
    }

    const match = tags.match(/re-watched:\s(\d+)/i)

    return match ? parseInt(match[1], 10) : 0
}

/**
 * Extract the total duration in minutes from API data.
 */
function getDuration(duration) {
    if (!duration) {
        return 0
    }

    // Convert hours into minutes
    if (/hr/i.test(duration)) {
        const [ , hours, minutes ] = duration.match(/(\d+)\s?hr\.?\s?(\d+)?/i)

        return (parseInt(hours, 10) * 60) + (minutes ? parseInt(minutes, 10) : 0)
    }

    if (/\d+/.test(duration)) {
        const [ digits ] = duration.match(/\d+/)

        if (digits) {
            return parseInt(digits, 10)
        }
    }

    return 0
}

// Proxy for the generated anime object to check certain set values
const animeProxy = {
    set(object, prop, value) {
        if (has(TYPES, prop) && value !== false && value !== null) {
            validateType(prop, value, object.title)
        }

        return Reflect.set(object, prop, value)
    },
}

// Exports
module.exports = {
    validateType,
    removeInvalidChars,
    getRewatchCount,
    getDuration,
    animeProxy,
}
