import React from 'react'

import { formatDuration, PROP_TYPES } from 'src/helpers/generic'

/**
 * Displays the total duration of the anime and the duration per episode.
 */
export default function Duration({ anime: { episodeDuration, episodes } }) {
    if (!episodeDuration || !episodes) {
        return 'Unknown'
    }

    return (
        <>
            {formatDuration(episodeDuration * episodes, true)}
            {episodes > 1 && (
                <span className="has-text-grey"> &ndash; {formatDuration(episodeDuration, true)} per episode</span>
            )}
        </>
    )
}

Duration.propTypes = {
    anime: PROP_TYPES.ANIME.isRequired,
}
