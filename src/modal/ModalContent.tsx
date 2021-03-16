import { FunctionComponent } from 'react'

import { Col, Divider, Row, Space, Timeline, Typography } from 'antd'
import styled, { createGlobalStyle } from 'styled-components'

import FormattedBytes from '../common/FormattedBytes'
import FormattedDuration from '../common/FormattedDuration'
import WatchingStatus from '../common/WatchingStatus'
import FilterLabel from '../filters/FilterLabel'
import { Anime } from '../types'

import RelatedAnimeInfo from './RelatedAnimeInfo'

const CenteredCol = styled(Col)`
    text-align: center;
`

const Image = styled.img`
    width: 100%;
    border-radius: 4px;
`

const Score = styled(Typography.Title)`
    margin: 16px 0 8px !important;
`

const TightDivider = styled(Divider)`
    margin: 16px 0;
`

const SpacedTimeline = styled(Timeline)`
    margin: 16px 0;
`

const RelatedAnimeSection = styled.div`
    & + & {
        margin-top: 16px;
    }
`

const RelatedAnimeList = styled.ul`
    padding: 0;
    margin: -4px 0 -4px 36px;
`

const RelatedAnimeListItem = styled.li`
    margin: 4px 0;
`

const labelWidth = 15

const GlobalStyle = createGlobalStyle`
    .ant-timeline.ant-timeline-label .ant-timeline-item-label {
        width: calc(${labelWidth}% - 12px);
    }

    .ant-timeline.ant-timeline-label .ant-timeline-item-tail,
    .ant-timeline.ant-timeline-label .ant-timeline-item-head {
        left: ${labelWidth}%;
    }

    .ant-timeline.ant-timeline-label .ant-timeline-item-left .ant-timeline-item-content {
        left: calc(${labelWidth}% - 4px);
        width: calc(${100 - labelWidth}% - 14px);
    }
`

/**
 * Displays all information about an anime for the modal.
 */
const ModalContext: FunctionComponent<{
    anime: Anime
    getAnime: (id: number) => Anime
    openModal: (id: number) => void
}> = ({
    anime: {
        id,
        title,
        englishTitle,
        synonyms,
        image,
        score,
        meanScore,
        rank,
        type,
        airingStatus,
        watchingStatus,
        totalWatchedEpisodes,
        totalEpisodes,
        totalDuration,
        totalWatchTime,
        totalRewatchedTimes,
        isRewatching,
        release,
        genres,
        studios,
        prequels,
        sequels,
        related,
        size,
    },
    getAnime,
    openModal,
}) => {
    const hasSeries = !!prequels?.length || !!sequels?.length

    return (
        <Row gutter={16}>
            <GlobalStyle />
            <CenteredCol span={5}>
                <Image src={image} alt={title} />
                <Score level={5}>
                    <strong>
                        <FilterLabel name="score" value={score} />
                    </strong>
                </Score>
                <WatchingStatus
                    watchingStatus={watchingStatus}
                    totalWatchedEpisodes={totalWatchedEpisodes}
                    totalEpisodes={totalEpisodes}
                    isRewatching={isRewatching}
                />
                <TightDivider />
                <Space direction="vertical" size={4}>
                    {!!meanScore && <Typography.Text>Mean MAL score: {meanScore}</Typography.Text>}
                    <Typography.Text>Ranked #{rank}</Typography.Text>
                </Space>
                <TightDivider />
                <Space direction="vertical" size={4}>
                    <Typography.Text>
                        <FilterLabel name="type" value={type} />
                        {(type !== 'Movie' || totalEpisodes > 1) && (
                            <>
                                {' '}
                                &ndash; {totalEpisodes || '?'} episode{totalEpisodes > 1 && 's'}
                            </>
                        )}
                    </Typography.Text>
                    <Typography.Text>{airingStatus}</Typography.Text>
                </Space>
                <TightDivider />
                <Typography.Link href={`https://myanimelist.net/anime/${id}`} target="_blank" rel="noreferrer noopener">
                    View on MyAnimeList.net
                </Typography.Link>
            </CenteredCol>
            <Col span={hasSeries ? 10 : 19}>
                {(englishTitle || synonyms) && (
                    <>
                        <Typography.Title level={5}>Alternative titles</Typography.Title>
                        <Space direction="vertical" size={4}>
                            {englishTitle && (
                                <Typography.Text>
                                    <strong>English:</strong> {englishTitle}
                                </Typography.Text>
                            )}
                            {synonyms && (
                                <Typography.Text>
                                    <strong>Synonyms:</strong> {synonyms.join(', ')}
                                </Typography.Text>
                            )}
                        </Space>
                        <TightDivider />
                    </>
                )}
                <Typography.Title level={5}>Statistics</Typography.Title>
                <Space direction="vertical" size={4}>
                    {!!size && (
                        <Typography.Text>
                            <strong>Storage size:</strong> <FormattedBytes bytes={size} />
                            <Typography.Text type="secondary">
                                {' '}
                                (average <FormattedBytes bytes={size / totalEpisodes} /> per episode)
                            </Typography.Text>
                        </Typography.Text>
                    )}
                    <Typography.Text>
                        <strong>Duration:</strong> <FormattedDuration duration={totalDuration} />
                    </Typography.Text>
                    {!!totalWatchTime && (
                        <Typography.Text>
                            <strong>Watch time:</strong> <FormattedDuration duration={totalWatchTime} />
                            {!!totalRewatchedTimes && (
                                <Typography.Text type="secondary">
                                    {' '}
                                    (rewatched {totalRewatchedTimes} time{totalRewatchedTimes > 1 && 's'})
                                </Typography.Text>
                            )}
                        </Typography.Text>
                    )}
                    {release && (
                        <Typography.Text>
                            <strong>Release:</strong> {release}
                        </Typography.Text>
                    )}
                    {!!genres?.length && (
                        <Typography.Text>
                            <strong>Genres:</strong> {genres.join(', ')}
                        </Typography.Text>
                    )}
                    {!!studios?.length && (
                        <Typography.Text>
                            <strong>Studios:</strong> {studios.join(', ')}
                        </Typography.Text>
                    )}
                </Space>
                {!!related?.length && (
                    <>
                        <Divider />
                        <Typography.Title level={5}>Related anime</Typography.Title>
                        {related.map(({ type: relationType, anime }) => (
                            <RelatedAnimeSection key={relationType}>
                                <strong>{relationType}</strong>
                                <RelatedAnimeList>
                                    {anime.map((relatedAnime) => (
                                        <RelatedAnimeListItem key={relatedAnime.id}>
                                            <RelatedAnimeInfo
                                                anime={relatedAnime}
                                                getAnime={getAnime}
                                                openModal={openModal}
                                            />
                                        </RelatedAnimeListItem>
                                    ))}
                                </RelatedAnimeList>
                            </RelatedAnimeSection>
                        ))}
                    </>
                )}
            </Col>
            {hasSeries && (
                <Col span={9}>
                    <Typography.Title level={5}>Series</Typography.Title>
                    {/* Timeline requires its own components to be direct children so this cannot be abstracted away
                        under a custom component */}
                    <SpacedTimeline mode="left">
                        {prequels?.map((prequelAnime) => (
                            <Timeline.Item
                                label={<Typography.Text type="secondary">Prequel</Typography.Text>}
                                color="gray"
                                key={prequelAnime.map(({ id: sequelAnimeId }) => sequelAnimeId).join('-')}
                            >
                                <Space direction="vertical">
                                    {prequelAnime.map((relatedAnime) => (
                                        <RelatedAnimeInfo
                                            anime={relatedAnime}
                                            getAnime={getAnime}
                                            openModal={openModal}
                                            key={relatedAnime.id}
                                        />
                                    ))}
                                </Space>
                            </Timeline.Item>
                        ))}
                        <Timeline.Item>
                            <Space>
                                {title}
                                <WatchingStatus
                                    watchingStatus={watchingStatus}
                                    totalWatchedEpisodes={totalWatchedEpisodes}
                                    totalEpisodes={totalEpisodes}
                                    isRewatching={isRewatching}
                                />
                            </Space>
                        </Timeline.Item>
                        {sequels?.map((sequelAnime) => (
                            <Timeline.Item
                                label={<Typography.Text type="secondary">Sequel</Typography.Text>}
                                color="gray"
                                key={sequelAnime.map(({ id: sequelAnimeId }) => sequelAnimeId).join('-')}
                            >
                                <Space direction="vertical">
                                    {sequelAnime.map((relatedAnime) => (
                                        <RelatedAnimeInfo
                                            anime={relatedAnime}
                                            getAnime={getAnime}
                                            openModal={openModal}
                                            key={relatedAnime.id}
                                        />
                                    ))}
                                </Space>
                            </Timeline.Item>
                        ))}
                    </SpacedTimeline>
                </Col>
            )}
        </Row>
    )
}

export default ModalContext
