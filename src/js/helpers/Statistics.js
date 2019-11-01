/**
 * Returns only watching, completed, on-hold, and dropped anime to be used in statistics.
 * @param {Array} anime Array of anime objects.
 * @returns {Array}
 */
function getStatisticsAnime(anime) {
    return anime.filter(({ status }) => status < 5)
}

/**
 * Addition reducer, returns the sum of two numbers.
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */
function add(a, b) {
    return a + b
}

/**
 * Row reducer, returns the sum of all values.
 * @param {Array} row A row of statistics.
 * @returns {number}
 */
function rowReducer(row) {
    return row.reduce(add)
}

/**
 * Returns a 2D array of each anime status within each rating, populated with either count of matched anime or
 * total of all data.
 * @param {Array} allAnime Array of all the anime objects to calculate totals for.
 * @param {string} property Name of the anime property to calculate.
 * @param {boolean} countOnly Whether to only count how many times the property appears, its actual value.
 * @returns {Object}
 */
function calculateTotals(allAnime, property, countOnly) {
    // Create the 2D array to populate
    const totals = Array.from({ length: 11 }, () => Array(7).fill(0))

    // Increment the number of matched anime or add up the data, if the rating is false or null, use 0
    if (countOnly) {
        for (const { rating, status } of allAnime) {
            totals[rating || 0][status] += 1
        }
    } else {
        for (const { rating, status, [property]: value } of allAnime) {
            totals[rating || 0][status] += value
        }
    }

    // Sum of all data
    const sum = allAnime.map(anime => anime[property]).reduce(add)

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
    getStatisticsAnime,
    add,
    calculateTotals,
}
