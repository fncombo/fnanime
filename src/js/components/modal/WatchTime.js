// React
import React from 'react'

// Helpers
import { formatDuration } from 'js/helpers/Statistics'

/**
 * Display the total watch time of this anime based on episode duration and number of episodes watched.
 */
function WatchTime({ episodeDuration, episodes, episodesWatched, watchTime, rewatchCount }) {
    if (!episodeDuration || !episodesWatched) {
        return 'None'
    }

    // If rewatched anime or it's a movie, say how many total times watched
    if (rewatchCount || (episodesWatched && episodes === 1)) {
        return (
            <>
                {formatDuration(watchTime, true)}
                <span className="has-text-grey">
                    &nbsp;&ndash; watched {rewatchCount + 1} time{rewatchCount + 1 > 1 ? 's' : ''}
                </span>
            </>
        )
    }

    // Otherwise say how many episodes out of total have watched
    if (episodesWatched) {
        return (
            <>
                {formatDuration(watchTime, true)}
                <span className="has-text-grey">
                    &nbsp;&ndash; {episodesWatched}/{episodes || '?'} episodes
                </span>
            </>
        )
    }

    return formatDuration(watchTime, true)
}

export default WatchTime
