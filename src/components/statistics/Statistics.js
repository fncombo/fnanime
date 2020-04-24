import React, { useContext } from 'react'

import { useInView } from 'react-intersection-observer'

import 'src/styles/Statistics.scss'

import { GlobalState } from 'src/data/GlobalState'

import { formatDuration } from 'src/helpers/Generic'
import { getStatisticsAnime, calculateTotals } from 'src/helpers/Statistics'
import fileSize from 'src/helpers/FileSize'

import StatisticsRow from 'src/components/statistics/StatisticsRow'

/**
 * Show all the ratings, the number of anime per rating, and a column for each of the other totals.
 * Each totals column has a header with its name, and a footer of the "totals total".
 */
export default function Statistics() {
    const {
        state: { anime },
    } = useContext(GlobalState)
    const [ref, inView, entry] = useInView()

    // Do not render if not in view and if haven't scrolled past this component yet. If already rendered and
    // scrolled past, keep it
    if (!inView && entry && entry.boundingClientRect.y >= 0) {
        return <div className="statistics-placeholder" ref={ref} />
    }

    const allAnime = getStatisticsAnime(anime)

    // No anime to display
    if (!allAnime.length) {
        return null
    }

    // How many anime there are for each of these data points
    const totals = {
        rating: calculateTotals(allAnime, 'rating', true),
        size: calculateTotals(allAnime, 'size'),
        episodes: calculateTotals(allAnime, 'episodes'),
        totalDuration: calculateTotals(allAnime, 'totalDuration'),
        watchTime: calculateTotals(allAnime, 'watchTime'),
    }

    // First and last ratings which have anime to them (excluding "not rated")
    // e.g. [0, 0, x, x, 0, x, x, 0] turns into [x, x, 0, x, x]
    const checkArray = totals.rating.totalsPerRating.slice(1)
    const firstNonZero = checkArray.findIndex((value) => !!value)
    const lastNonZero = checkArray.length - [...checkArray].reverse().findIndex((value) => !!value)

    // Don't show stats if all shown anime aren't rated
    if (firstNonZero + lastNonZero === 0) {
        return null
    }

    return (
        <div className="statistics has-text-centered" ref={ref}>
            <div className="columns is-mobile is-not-progress">
                <div className="column is-1-tablet is-rating">
                    <h6>Rating</h6>
                </div>
                <div className="column">
                    <h6>Number of Anime</h6>
                </div>
                <div className="column">
                    <h6>Total Storage Size</h6>
                </div>
                <div className="column">
                    <h6>Total Number of Episodes</h6>
                </div>
                <div className="column">
                    <h6>Total Duration</h6>
                </div>
                <div className="column">
                    <h6>Total Watch Time</h6>
                </div>
            </div>
            {Array.from({ length: 10 }, (value, index) => index + 1)
                .slice(firstNonZero, lastNonZero)
                .map((rating) => <StatisticsRow rating={rating} totals={totals} key={rating} />)
                .reverse()}
            {!!totals.rating.totalsPerRating[0] && <StatisticsRow rating={0} totals={totals} />}
            {firstNonZero !== lastNonZero && (
                <div className="columns is-mobile is-not-progress">
                    <div className="column is-2-mobile is-1-tablet is-rating">
                        <h6>Totals</h6>
                    </div>
                    <div className="column">
                        Mean Rating:{' '}
                        {totals.rating.average
                            ? (Math.round(totals.rating.average * 100) / 100).toLocaleString()
                            : 'N/A'}
                    </div>
                    <div className="column">{totals.size.sum ? fileSize(totals.size.sum) : <>&mdash;</>}</div>
                    <div className="column">
                        {totals.episodes.sum ? totals.episodes.sum.toLocaleString() : <>&mdash;</>}
                    </div>
                    <div className="column">
                        {totals.totalDuration.sum ? formatDuration(totals.totalDuration.sum) : <>&mdash;</>}
                    </div>
                    <div className="column">
                        {totals.watchTime.sum ? formatDuration(totals.watchTime.sum) : <>&mdash;</>}
                    </div>
                </div>
            )}
        </div>
    )
}
