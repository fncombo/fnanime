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
        for ( const { rating, status } of anime) {
            totals[rating][status] += 1
        }
    } else {
        for ( const { rating, status, [property]: value } of anime) {
            totals[rating][status] += value
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

// Exports
export {
    add,
    calculateTotals,
}
