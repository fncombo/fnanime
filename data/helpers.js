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

// Exports
module.exports = {
    removeInvalidChars,
    getRewatchCount,
}
