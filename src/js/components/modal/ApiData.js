// React
import React, { useContext } from 'react'

// Data
import { ModalState } from 'js/data/GlobalState'

// Helpers
import { getNestedProperty } from 'js/helpers/Modal'

/**
 * Attempt to get API data using a string property e.g. "foo.bar". Returns the found data or the fallback.
 */
function ApiData({ property, fallback = <>&mdash;</>, children }) {
    const { modalState: { apiData } } = useContext(ModalState)
    const data = getNestedProperty(apiData, ...property.split('.'))

    // No such API data or it's empty, return the fallback
    if (!data) {
        return fallback
    }

    // Render function provided, pass the data to it
    if (typeof children === 'function') {
        return children(data)
    }

    // The data is a number, format it properly
    if (/^\d+$/.test(data)) {
        return data.toLocaleString()
    }

    return data
}

export default ApiData
