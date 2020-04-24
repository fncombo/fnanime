import React from 'react'
import PropTypes from 'prop-types'

/**
 * Shows the number of episodes the anime has if it's known.
 */
export default function Episodes({ children: episodes }) {
    if (!episodes) {
        return <> &ndash; ? episodes</>
    }

    return (
        <>
            {' '}
            &ndash; {episodes} episode{episodes > 1 && 's'}
        </>
    )
}

Episodes.propTypes = {
    children: PropTypes.number.isRequired,
}
