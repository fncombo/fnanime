// React
import React from 'react'

// Helpers
import { formatDuration } from 'js/helpers/Generic'

/**
 * Display the total watch time of this anime based on episode duration and number of episodes watched.
 */
export default function WatchTime({ episodeDuration, episodes, episodesWatched, watchTime, rewatchCount }) {
    if (!episodeDuration || !episodesWatched) {
        return 'None'
    }

    // If rewatched anime or it's a movie, say how many total times watched
    if (rewatchCount || (episodesWatched && episodes === 1)) {
        // Singular or plural based on the total number of times watched
        const word = rewatchCount + 1 > 1 ? 'times' : 'time'

        return (
            <>
                {formatDuration(watchTime, true)}
                <span className="has-text-grey"> &ndash; watched {rewatchCount + 1} {word}</span>
            </>
        )
    }

    // Otherwise say how many episodes out of total have watched
    if (episodesWatched) {
        return (
            <>
                {formatDuration(watchTime, true)}
                <span className="has-text-grey"> &ndash; {episodesWatched}/{episodes || '?'} episodes</span>
            </>
        )
    }

    return formatDuration(watchTime, true)
}
