import { FunctionComponent } from 'react'

import { Card, Tag, Tooltip, Typography } from 'antd'
import { InView } from 'react-intersection-observer'
import styled from 'styled-components'

import FilterTag from '../filters/FilterTag'
import { Anime } from '../types'

const imageWidth = 155

const Container = styled.div`
    display: flex;
    width: ${imageWidth}px;
    min-height: 287px;
    margin: 4px;
`

const AnimeCard = styled(Card)`
    width: 100%;

    .ant-card-body {
        height: 100%;
        padding: 0;
    }
`

const AnimeCardImage = styled.img`
    margin: -1px 0 0 -1px;
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
`

const AnimeCardBody = styled.div`
    padding: 8px;
`

const AnimeCardTitle = styled(Typography.Text)`
    display: -webkit-box;
    overflow: hidden;
    width: 100%;
    margin-bottom: 8px;
    -webkit-box-orient: vertical;
    font-weight: 600;
    -webkit-line-clamp: 2;
`

const WatchingStatus = styled.div`
    margin-top: 8px;
`

const FavoriteIcon = styled.span`
    display: inline-block;
    margin-right: 4px;
    cursor: help;
`

/**
 * Displays various anime info as a card for the gallery.
 */
const GalleryCard: FunctionComponent<{
    anime: Anime
}> = ({ anime: { image, title, type, episodeCount, watchingStatus, watchedEpisodeCount, isFavorite } }) => (
    <InView rootMargin="300px">
        {({ ref, inView }) => (
            <Container ref={ref}>
                {inView && (
                    <AnimeCard>
                        <AnimeCardImage
                            src={image}
                            alt={title}
                            width={imageWidth}
                            height={imageWidth * 1.4}
                            loading="lazy"
                        />
                        <AnimeCardBody>
                            <AnimeCardTitle>
                                {isFavorite && (
                                    <Tooltip title="Favourite anime" color="red">
                                        <FavoriteIcon>❤</FavoriteIcon>
                                    </Tooltip>
                                )}
                                {title}
                            </AnimeCardTitle>
                            <Tag>{type}</Tag>
                            {(type !== 'Movie' || episodeCount > 1) && (
                                <>
                                    {' '}
                                    {episodeCount} episode{episodeCount > 1 && 's'}
                                </>
                            )}
                            {watchingStatus !== 'Completed' && (
                                <WatchingStatus>
                                    <FilterTag name="watchingStatus" value={watchingStatus}>
                                        {(label) => `${label} (${watchedEpisodeCount}/${episodeCount})`}
                                    </FilterTag>
                                </WatchingStatus>
                            )}
                        </AnimeCardBody>
                    </AnimeCard>
                )}
            </Container>
        )}
    </InView>
)

export default GalleryCard
