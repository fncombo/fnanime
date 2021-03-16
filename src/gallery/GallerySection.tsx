import { FunctionComponent, ReactNode } from 'react'

import { Typography } from 'antd'
import sort from 'fast-sort'
import { InView } from 'react-intersection-observer'
import styled from 'styled-components'

import FilterLabel from '../filters/FilterLabel'
import { Anime, Score } from '../types'

import GalleryCard from './GalleryCard'

type GalleryScore = Score | 'Watching'

const descriptions: Record<GalleryScore, ReactNode> = {
    Watching: 'This is what I am currently watching 👀',
    10: "If you don't like these as much as I do then we can't be friends 🤔",
    9: 'The very best anime which you can spend your time on 🤩',
    8: 'The second best (surprise!) anime which you can spend your time on 😉',
    7: "These are average anime which were nice and didn't make me regret the time 🙃",
    6: 'Not terrible but not that good either, better luck next time 🥱',
    5: 'Low effort, incomprehensible, overrated, deep, you get the idea 🙄',
    4: "If you rated any of these more than an 8 then we can't be friends either 🙂",
    3: 'How did these even get a budget approved for them 😑',
    2: "I've never rating anything this low before so if you see this message, congratulations!",
    1: "I've never rating anything this low before so if you see this message, congratulations!",
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

const Title = styled(Typography.Title)<{ $isStuck: boolean }>`
    position: sticky;
    z-index: 10;
    top: 0;
    padding: 16px 0;
    margin-bottom: 0 !important;
    background: #fff;
    box-shadow: ${({ $isStuck }): string => ($isStuck ? boxShadow : '')};
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
            {({ ref, inView, entry }): ReactNode => (
                <>
                    <Sentinel ref={ref} />
                    <Title level={4} $isStuck={!inView && !!entry}>
                        {typeof score === 'string' ? score : <FilterLabel name="score" value={score} />}
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
