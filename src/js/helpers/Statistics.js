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
 * Row reducer.
 */
function rowReducer(row) {
    return row.reduce(add)
}

/**
 * Returns a 2D array of each anime status within each rating, populated with either count
 * of matched anime or total of all data.
 */
function calculateTotals(anime, property, countOnly) {
    // Create the 2D array to populate
    const totals = Array.from({ length: 11 }, () => Array(7).fill(0))

    // Increment the number of matched anime or add up the data, if the rating is false or null, use 0
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

    // Count of all data, if counting score, exclude not rated anime to not bring down the average
    const count = property === 'rating'
        ? totals.slice(1).map(rowReducer).reduce(add)
        : totals.map(rowReducer).reduce(add)

    // Biggest total
    const max = Math.max(...totals.map(rowReducer))

    // Average of all totals if sum and count are not 0, otherwise 0
    const average = (sum / count) || 0

    return {
        totals,
        sum,
        count,
        max,
        average,
    }
}

// Exports
export {
    statisticsAnime,
    add,
    calculateTotals,
}
