import React from 'react'
import PropTypes from 'prop-types'

import fileSize from 'src/helpers/file-size'

/**
 * Displays the total anime size. If anime has episodes, also displays the average size per episode.
 */
export default function Size({ size, episodes }) {
    return (
        <>
            {size ? fileSize(size) : 'None'}
            {!!size && episodes > 1 && (
                <span className="has-text-grey"> &ndash; average {fileSize(size / episodes)} per episode</span>
            )}
        </>
    )
}

Size.propTypes = {
    size: PropTypes.number.isRequired,
    episodes: PropTypes.number.isRequired,
}
