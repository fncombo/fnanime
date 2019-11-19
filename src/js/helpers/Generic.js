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

export {
    // eslint-disable-next-line import/prefer-default-export
    formatDuration,
}
