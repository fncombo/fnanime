// React
import React, { useContext } from 'react'

// Data
import { ModalState } from 'js/data/GlobalState'

// Helpers
import { getNestedProperty } from 'js/helpers/Modal'

/**
 * Attempt to get API data using a string property e.g. "foo.bar". Returns the found data, the fallback, or a dash.
 */
export default function ApiData({ property, fallback, children }) {
    const { modalState: { apiData } } = useContext(ModalState)
    const data = getNestedProperty(apiData, ...property.split('.'))

    // No such API data or it's empty, return the fallback
    if (!data) {
        return fallback || <>&mdash;</>
    }

    // Render function provided, pass the data to it
    if (typeof children === 'function') {
        return children(data)
    }

    // The data is a number, format it properly
    if (typeof data === 'number') {
        return data.toLocaleString()
    }

    return data
}
