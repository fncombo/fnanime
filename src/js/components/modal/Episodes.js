// React
import React from 'react'

/**
 * Shows the number of episodes the anime has if it's known.
 */
function Episodes({ children: episodes }) {
    if (!episodes) {
        return <> &ndash; ? episodes</>
    }

    return <> &ndash; {episodes} episode{episodes > 1 && 's'}</>
}

export default Episodes
