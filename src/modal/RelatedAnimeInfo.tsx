import { FunctionComponent } from 'react'

import { Space, Typography } from 'antd'

import WatchingStatus from '../common/WatchingStatus'
import { Anime, RelatedAnime } from '../types'

/**
 * Displays a related anime's title as a link. If the related anime is present in the list, also display its watching
 * status and clicking on it will open its modal. Otherwise, clicking on it will open the anime's MyAnimeList page
 * in a new tab.
 */
const RelatedAnimeInfo: FunctionComponent<{
    anime: RelatedAnime
    getAnime: (id: number) => Anime
    openModal: (id: number) => void
}> = ({ anime: { id, title }, getAnime, openModal }) => {
    const relatedAnime = title ? undefined : getAnime(id)

    // Related anime without a title are present in our list
    if (relatedAnime) {
        return (
            <Space>
                <Typography.Link onClick={(): void => openModal(id)}>{relatedAnime.title}</Typography.Link>
                <WatchingStatus
                    watchingStatus={relatedAnime.watchingStatus}
                    totalWatchedEpisodes={relatedAnime.totalWatchedEpisodes}
                    totalEpisodes={relatedAnime.totalEpisodes}
                    isRewatching={relatedAnime.isRewatching}
                />
            </Space>
        )
    }

    return (
        <Typography.Link href={`https://myanimelist.net/anime/${id}`} target="_blank" rel="noreferrer noopener">
            {title}
        </Typography.Link>
    )
}

export default RelatedAnimeInfo
