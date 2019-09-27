// Libraries
import prettyMilliseconds from 'pretty-ms'

/**
 * Only include watching, completed, on-hold, and dropped anime in statistics.
 */
function statisticsAnime(anime) {
    return anime.filter(({ status }) => status < 5)
}

/**
 * Addition reducer.
 */
function add(a, b) {
    return a + b
}

/**
 * Returns a 2D array of each anime status within each rating, populated with either count
 * of matched anime or total of all data.
 */
function calculateTotals(anime, property, countOnly) {
    // Create the 2D array to populate
    const totals = [ ...Array(11) ].map(() => Array(7).fill(0))

    // Increment the number of matched anime or add up the data
    if (countOnly) {
        for (const { rating, status } of anime) {
            totals[rating || 0][status] += 1
        }
    } else {
        for (const { rating, status, [property]: value } of anime) {
            totals[rating || 0][status] += value
        }
    }

    // Sum of all data
    const sum = anime.map(({ [property]: value }) => value).reduce(add)

    // Count of all data
    const count = totals.slice(1).map(row => row.reduce(add)).reduce(add)

    // Biggest total
    const max = Math.max(...totals.slice(1).map(row => row.reduce(add)))

    // Average of all totals
    const average = sum / count

    return {
        totals,
        sum,
        count,
        max,
        average,
    }
}

/**
 * Convert duration from minutes into milliseconds for the library and then print pretty human-readable time.
 */
function formatDuration(duration) {
    return prettyMilliseconds(duration * 60000, { verbose: true })
}

// Exports
export {
    statisticsAnime,
    add,
    calculateTotals,
    formatDuration,
}
