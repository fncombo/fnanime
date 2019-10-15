// React
import React from 'react'

// Helpers
import fileSize from 'js/helpers/FileSize'

/**
 * Displays the total anime size. If anime has episodes, also displays the average size per episode.
 */
function Size({ size, episodes }) {
    return (
        <>
            {size ? fileSize(size) : 'None'}
            {!!size && episodes > 1 &&
                <span className="has-text-grey"> &ndash; average {fileSize(size / episodes)} per episode</span>
            }
        </>
    )
}

export default Size
