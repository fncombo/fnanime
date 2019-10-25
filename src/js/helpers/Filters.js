/**
 * Function to reverse sort filter values.
 */
function reverseSort(values) {
    return values.sort((a, b) => b - a)
}

/**
 * Function to exclude falsy filter values.
 */
function excludeBlankValues(values) {
    return values.filter(value => !!value)
}

// Exports
export {
    reverseSort,
    excludeBlankValues,
}
