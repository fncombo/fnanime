// React
import React from 'react'

// Helpers
import { formatDuration } from 'js/helpers/Generic'

/**
 * Displays the total duration of the anime and the duration per episode.
 */
export default function Duration({ episodeDuration, episodes }) {
    if (!episodeDuration || !episodes) {
        return 'Unknown'
    }

    return (
        <>
            {formatDuration(episodeDuration * episodes, true)}
            {episodes > 1 &&
                <span className="has-text-grey"> &ndash; {formatDuration(episodeDuration, true)} per episode</span>
            }
        </>
    )
}
