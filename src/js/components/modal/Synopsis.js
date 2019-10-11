// React
import React from 'react'

// Helpers
import { replaceSpecialChars } from 'js/helpers/Modal'

/**
 * Synopsis text for this anime. Unfortunately the API returns it only all as one huge paragraph.
 */
function Synopsis({ data }) {
    if (!data || typeof data !== 'string') {
        return <p>No synopsis</p>
    }

    return <p>{replaceSpecialChars(data)}</p>
}

export default Synopsis
