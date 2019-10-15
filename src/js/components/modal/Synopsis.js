// React
import React from 'react'

// Helpers
import { replaceSpecialChars } from 'js/helpers/Modal'

/**
 * Synopsis text for this anime. Unfortunately the API returns it only all as one huge paragraph.
 */
function Synopsis({ data }) {
    return <p>{typeof data === 'string' ? replaceSpecialChars(data) : 'No synopsis'}</p>
}

export default Synopsis
