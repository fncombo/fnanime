import React from 'react'

import { replaceSpecialChars } from 'src/helpers/Modal'

/**
 * Synopsis text for this anime. Unfortunately the API returns it only all as one huge paragraph.
 */
export default function Synopsis({ children: text }) {
    return <p>{typeof text === 'string' ? replaceSpecialChars(text) : 'No synopsis'}</p>
}
