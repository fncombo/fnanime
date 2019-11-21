// Libraries
import prettyMilliseconds from 'pretty-ms'

/**
 * Converts duration from minutes into milliseconds for the library and returns the pretty human-readable time.
 * @param {number} duration Duration in minutes.
 * @param {boolean} verbose Whether to use verbose pretty date (e.g. 5d vs 5 days).
 * @return {string}
 */
function formatDuration(duration, verbose = false) {
    return prettyMilliseconds(duration * 60000, { verbose })
}

/**
 * Returns the ordinal suffix string for a number.
 * @param {number} number Number to suffix.
 * @returns {string}
 */
function formatOrdinal(number) {
    const tens = number % 100

    if (tens >= 10 && tens <= 20) {
        return 'th'
    }

    const ones = number % 10

    switch (ones) {
    case 1:
        return 'st'

    case 2:
        return 'nd'

    case 3:
        return 'rd'

    default:
        return 'th'
    }
}

export {
    formatDuration,
    formatOrdinal,
}
