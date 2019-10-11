// Libraries
import prettyMilliseconds from 'pretty-ms'

/**
 * Convert duration from minutes into milliseconds for the library and then print pretty human-readable time.
 */
function formatDuration(duration, verbose = false) {
    return prettyMilliseconds(duration * 60000, { verbose })
}

export {
    formatDuration,
}
