import React from 'react'
import PropTypes from 'prop-types'

import { isFullString } from 'is-what'

import { replaceSpecialChars } from 'src/helpers/modal'

/**
 * Synopsis text for this anime. Unfortunately the API returns it only all as one huge paragraph.
 */
export default function Synopsis({ children: text }) {
    return <p>{isFullString(text) ? replaceSpecialChars(text) : 'No synopsis'}</p>
}

Synopsis.propTypes = {
    children: PropTypes.string,
}
