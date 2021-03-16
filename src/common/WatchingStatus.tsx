import { FunctionComponent, ReactNode } from 'react'

import FilterTag from '../filters/FilterTag'
import { Anime } from '../types'

/**
 * Displays a tag for an anime's watching status. If the anime is anything but completed or planned, also displays
 * how many episodes have been watched.
 */
const WatchingStatus: FunctionComponent<{
    watchingStatus: Anime['watchingStatus']
    totalWatchedEpisodes: number
    totalEpisodes: number
    isRewatching: boolean
}> = ({ watchingStatus, totalWatchedEpisodes, totalEpisodes, isRewatching }) => (
    <FilterTag name="watchingStatus" value={watchingStatus}>
        {(label): ReactNode => {
            if (watchingStatus === 'Completed' || watchingStatus === 'Planned') {
                return label
            }

            const episodes = totalEpisodes ? `${totalWatchedEpisodes}/${totalEpisodes}` : totalWatchedEpisodes

            if (isRewatching) {
                return `Rewatching (${episodes})`
            }

            return `${label} (${episodes})`
        }}
    </FilterTag>
)

export default WatchingStatus
