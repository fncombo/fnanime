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

// Exports
module.exports = {
    removeInvalidChars,
    getRewatchCount,
    getDuration,
}
