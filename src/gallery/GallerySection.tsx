import { FunctionComponent, ReactNode } from 'react'

import { Typography } from 'antd'
import sort from 'fast-sort'
import { InView } from 'react-intersection-observer'
import styled from 'styled-components'

import { filtersDictionary } from '../filters/config'
import { Anime, Score } from '../types'

import GalleryCard from './GalleryCard'

type GalleryScore = Score | 'Watching'

const descriptions: Record<GalleryScore, ReactNode> = {
    Watching: 'This is what I am currently watching 👀',
    10: "The very best anime! If you don't like these as much as me then we can't be friends 🤔",
    9: "Very enjoyable, interesting and entertaining. Why can't all anime be like this 😔",
    8: 'I still like these a lot, really! I guess they were just missing that secret ingredient 🍯',
    7: "This is the average anime which was nice to watch and didn't make me regret the time 🙃",
    6: 'Not terrible but not that good either, better luck next time 🥱',
    5: 'Low effort, incomprehensible, overrated, "deep", you get the idea 🙄',
    4: "Yawn... if you rated one of these more than an 8 then we can't be friends either 🙂",
    3: 'How did these even get a budget approved for them 😑',
    2: 'I never rating anything this low before so if you see this message, congratulations!',
    1: 'I never rating anything this low before so if you see this message, congratulations!',
    0: (
        <>
            Haven&apos;t rated these yet! I also don&apos;t rate dropped anime with{' '}
            <a href="https://myanimelist.net/info.php?go=topanime" target="_blank" rel="noopener noreferrer">
                fewer than 20%
            </a>{' '}
            of the episodes watched 📉
        </>
    ),
}

const boxShadow = [
    '0 3px 6px -4px rgba(0, 0, 0, 0.12)',
    '0 6px 16px 0 rgba(0, 0, 0, 0.08)',
    '0 9px 28px 8px rgba(0, 0, 0, 0.05)',
].join(',')

const Container = styled.div`
    position: relative;
    margin: 24px 0;
`

const Sentinel = styled.div`
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    height: 1px;
`

const Title = styled(Typography.Title)<{ isStuck: boolean }>`
    position: sticky;
    z-index: 10;
    top: 0;
    padding: 16px 0;
    margin-bottom: 0 !important;
    background: #fff;
    box-shadow: ${({ isStuck }) => (isStuck ? boxShadow : '')};
    line-height: 1 !important;
    text-align: center;
`

const SubTitle = styled(Typography.Paragraph)`
    text-align: center;
`

const GalleryCards = styled.div`
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
`

/**
 * Displays a grid of cards for all anime. The section title is sticky at the top, and gains additional styling based
 * on whether it's sticky or not.
 */
const GallerySection: FunctionComponent<{
    score: GalleryScore
    anime: Anime[]
}> = ({ score, anime }) => (
    <Container>
        <InView>
            {({ ref, inView, entry }) => (
                <>
                    <Sentinel ref={ref} />
                    <Title level={4} isStuck={!inView && !!entry}>
                        {typeof score === 'string' ? score : filtersDictionary.score[score].label}
                    </Title>
                </>
            )}
        </InView>
        <SubTitle>{descriptions[score]}</SubTitle>
        <GalleryCards>
            {sort(anime)
                .asc('title')
                .map((sortedAnime) => (
                    <GalleryCard anime={sortedAnime} key={sortedAnime.id} />
                ))}
        </GalleryCards>
    </Container>
)

export default GallerySection
