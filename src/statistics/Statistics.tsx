import { FunctionComponent, ReactNode } from 'react'

import { Progress, Typography } from 'antd'
import styled from 'styled-components'

import FormattedBytes from '../common/FormattedBytes'
import FormattedDuration from '../common/FormattedDuration'
import { useFilters } from '../filters/Filters'
import { Anime } from '../types'

interface Totals {
    totalsPerScore: number[]
    maxPerScore: number
}

interface Column {
    key: keyof Anime
    header: string
    render: (value: number, percent: number) => ReactNode
    footer: (value: number) => ReactNode
    isCount?: boolean
    isAdvanced?: boolean
}

const columns: Column[] = [
    {
        key: 'id',
        header: 'Total anime',
        render: (value, percent): ReactNode => (
            <>
                {value.toLocaleString()} ({Math.round(percent).toLocaleString()}%)
            </>
        ),
        footer: (value): ReactNode => value.toLocaleString(),
        isCount: true,
    },
    {
        key: 'size',
        header: 'Total storage size',
        render: (value): ReactNode => <FormattedBytes bytes={value} />,
        footer: (value): ReactNode => <FormattedBytes bytes={value} />,
        isAdvanced: true,
    },
    {
        key: 'totalEpisodes',
        header: 'Total number of episodes',
        render: (value): ReactNode => value.toLocaleString(),
        footer: (value): ReactNode => value.toLocaleString(),
    },
    {
        key: 'totalDuration',
        header: 'Total duration',
        render: (value): ReactNode => <FormattedDuration duration={value} />,
        footer: (value): ReactNode => <FormattedDuration duration={value} />,
    },
    {
        key: 'totalWatchTime',
        header: 'Total watch time',
        render: (value): ReactNode => <FormattedDuration duration={value} />,
        footer: (value): ReactNode => <FormattedDuration duration={value} />,
    },
]

// Base array of all the scores from 1 to 10
const scoresBaseArray = Array.from({ length: 10 }, (_, i) => i)
    .reverse()
    .map((i) => i + 1)

/**
 * Calculates the total value or count for a particular key in the given anime.
 */
const calculateTotals = (anime: Anime[], key: keyof Anime, isCount = false): Totals => {
    const totalsPerScore = anime.reduce((accumulator, { score, [key]: value }) => {
        if (isCount) {
            accumulator[score] += 1
        } else if (typeof value === 'number') {
            accumulator[score] += value
        }

        return accumulator
    }, Array.from({ length: 11 }).fill(0) as number[])

    return {
        totalsPerScore,
        maxPerScore: Math.max(...totalsPerScore),
    }
}

const Row = styled.div`
    display: grid;
    grid-template-columns: 100px repeat(auto-fit, minmax(0, 1fr));

    &:not(:first-child) {
        border-top: 1px solid rgba(0, 0, 0, 0.06);
    }
`

const Col = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 8px 16px;
`

const ShortProgress = styled(Progress)`
    line-height: 0;
`

/**
 * Displays a simple table of statistics for the given anime. All the statistics progress bar percentages are relative
 * to each one within their columns.
 */
const Statistics: FunctionComponent = () => {
    const { anime, hasAdvancedFilters } = useFilters()

    const statisticsAnime = anime.filter(({ watchingStatus }) => watchingStatus !== 'Planned')

    const displayColumns = hasAdvancedFilters ? columns : columns.filter(({ isAdvanced }) => !isAdvanced)

    const data = displayColumns.reduce((accumulator, { key, isCount }) => {
        accumulator[key] = calculateTotals(statisticsAnime, key, isCount)

        return accumulator
    }, {} as Record<keyof Anime, Totals>)

    const rows = scoresBaseArray
        .map((i) => ({
            score: i,
            scoreAnime: statisticsAnime.filter(({ score }) => score === i),
        }))
        // Remove trailing and leading scores which have no anime against them
        .filter(
            ({ scoreAnime }, i, array) =>
                scoreAnime.length || (array[i - 1]?.scoreAnime.length && array[i + 1]?.scoreAnime.length)
        )

    return (
        <>
            <Row>
                <Col>Score</Col>
                {displayColumns.map(({ header, key }) => (
                    <Col key={key}>{header}</Col>
                ))}
            </Row>
            {rows.map(({ score }) => (
                <Row key={score}>
                    <Col>{score}</Col>
                    {displayColumns.map(({ render, key }) => {
                        const percent = (data[key].totalsPerScore[score] / data[key].maxPerScore) * 100

                        return (
                            <Col key={key}>
                                <Typography.Text>{render(data[key].totalsPerScore[score], percent)}</Typography.Text>
                                <ShortProgress percent={percent} showInfo={false} status="normal" />
                            </Col>
                        )
                    })}
                </Row>
            ))}
            <Row>
                <Col>Totals</Col>
                {displayColumns.map(({ footer, key }) => (
                    <Col key={key}>{footer(data[key].totalsPerScore.reduce((a, b) => a + b, 0))}</Col>
                ))}
            </Row>
        </>
    )
}

export default Statistics
