import PropTypes from 'prop-types'

import prettyMilliseconds from 'pretty-ms'

// Custom prop types
const PROP_TYPES = {}

PROP_TYPES.ANIME = PropTypes.exact({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    type: PropTypes.number.isRequired,
    episodes: PropTypes.number.isRequired,
    episodesWatched: PropTypes.number.isRequired,
    img: PropTypes.string.isRequired,
    status: PropTypes.number.isRequired,
    airStatus: PropTypes.number.isRequired,
    rating: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
    rewatchCount: PropTypes.number.isRequired,
    url: PropTypes.string.isRequired,
    favorite: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]).isRequired,
    genres: PropTypes.arrayOf(PropTypes.number).isRequired,
    subs: PropTypes.arrayOf(PropTypes.string).isRequired,
    resolution: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]).isRequired,
    source: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]).isRequired,
    videoCodec: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]).isRequired,
    bits: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]).isRequired,
    audioCodec: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]).isRequired,
    size: PropTypes.number.isRequired,
    studios: PropTypes.arrayOf(PropTypes.string).isRequired,
    episodeDuration: PropTypes.number.isRequired,
    episodeSize: PropTypes.number.isRequired,
    fileQuality: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]).isRequired,
    totalDuration: PropTypes.number.isRequired,
    watchTime: PropTypes.number.isRequired,
    index: PropTypes.number.isRequired,
    updated: PropTypes.bool.isRequired,
})

PROP_TYPES.STATISTICS = PropTypes.exact({
    totals: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)).isRequired,
    totalsPerRating: PropTypes.arrayOf(PropTypes.number).isRequired,
    sum: PropTypes.number.isRequired,
    count: PropTypes.number.isRequired,
    max: PropTypes.number.isRequired,
    average: PropTypes.number.isRequired,
})

/**
 * Converts duration from minutes into milliseconds for the library and returns the pretty human-readable time.
 *
 * @param {number} duration Duration in minutes.
 * @param {boolean} verbose Whether to use verbose pretty date (e.g. 5d vs 5 days).
 *
 * @returns {string} Pretty human-readable time.
 */
function formatDuration(duration, verbose = false) {
    return prettyMilliseconds(duration * 60000, { verbose })
}

/**
 * Returns the ordinal suffix string for a number.
 *
 * @param {number} number Number to suffix.
 *
 * @returns {string} Suffix string.
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

export { PROP_TYPES, formatDuration, formatOrdinal }
