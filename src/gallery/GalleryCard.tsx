import { FunctionComponent } from 'react'

import { Card, Tag, Tooltip, Typography } from 'antd'
import { useInView } from 'react-intersection-observer'
import styled from 'styled-components'

import WatchingStatus from '../common/WatchingStatus'
import { useModal } from '../modal/Modal'
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

const ImageContainer = styled.div`
    display: flex;
    overflow: hidden;
    width: ${imageWidth}px;
    height: ${imageWidth * 1.4}px;
    align-items: center;
    justify-content: center;
    margin: -1px 0 0 -1px;
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
`

const Image = styled.img`
    width: 100%;
    height: 100%;
    object-fit: cover;
`

const Body = styled.div`
    padding: 8px;
`

const Title = styled(Typography.Text)`
    display: -webkit-box;
    overflow: hidden;
    width: 100%;
    margin-bottom: 8px;
    -webkit-box-orient: vertical;
    font-weight: 600;
    -webkit-line-clamp: 2;
`

const WatchingStatusContainer = styled.div`
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
}> = ({
    anime: { id, image, title, type, totalEpisodes, watchingStatus, totalWatchedEpisodes, isFavorite, isRewatching },
}) => {
    const { ref, inView } = useInView({ rootMargin: '300px' })
    const openModal = useModal()

    return (
        <Container ref={ref}>
            {inView && (
                <AnimeCard onClick={(): void => openModal(id)} hoverable>
                    <ImageContainer>
                        <Image src={image} alt={title} />
                    </ImageContainer>
                    <Body>
                        <Title>
                            {isFavorite && (
                                <Tooltip title="Favourite anime" color="red">
                                    <FavoriteIcon>❤</FavoriteIcon>
                                </Tooltip>
                            )}
                            {title}
                        </Title>
                        <Tag>{type}</Tag>
                        {(type !== 'Movie' || totalEpisodes > 1) && (
                            <>
                                {' '}
                                {totalEpisodes} episode{totalEpisodes > 1 && 's'}
                            </>
                        )}
                        {watchingStatus !== 'Completed' && (
                            <WatchingStatusContainer>
                                <WatchingStatus
                                    watchingStatus={watchingStatus}
                                    totalWatchedEpisodes={totalWatchedEpisodes}
                                    totalEpisodes={totalEpisodes}
                                    isRewatching={isRewatching}
                                />
                            </WatchingStatusContainer>
                        )}
                    </Body>
                </AnimeCard>
            )}
        </Container>
    )
}

export default GalleryCard
