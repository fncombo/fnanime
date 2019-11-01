/**
 * Function to reverse sort filter values, returns the sorted array.
 * @param {string[]|number[]} values Array of strings or numbers to sort.
 * @returns {string[]|number[]}
 */
function reverseSort(values) {
    return values.sort((a, b) => b - a)
}

/**
 * Function to exclude falsy filter values, returns the filtered array.
 * @param {Array} values Array to filter.
 * @returns {Array}
 */
function excludeBlankValues(values) {
    return values.filter(value => !!value)
}

// Exports
export {
    reverseSort,
    excludeBlankValues,
}
