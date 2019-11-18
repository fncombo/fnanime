// React
import React, { useContext } from 'react'

// Data
import { GlobalState } from 'js/data/GlobalState'

/**
 * Displays how many downloaded and not downloaded anime there are.
 */
export default function Summary() {
    const { state: { anime } } = useContext(GlobalState)

    if (!anime.length) {
        return null
    }

    // Downloaded anime have a non-zero size
    const downloadedCount = anime.filter(({ size }) => !!size).length

    // The rest are not downloaded anime
    const notDownloadedCount = anime.length - downloadedCount

    if (downloadedCount && notDownloadedCount) {
        return <span>Found <strong>{downloadedCount}</strong> + {notDownloadedCount} anime</span>
    } else if (downloadedCount && !notDownloadedCount) {
        return <span>Found <strong>{downloadedCount}</strong> anime</span>
    } else if (!downloadedCount && notDownloadedCount) {
        return <span>Found {notDownloadedCount} anime</span>
    }
}
