// React
import React, { useContext } from 'react'

// Libraries
import { useInView } from 'react-intersection-observer'
import prettyMilliseconds from 'pretty-ms'

// Style
import 'scss/Statistics.scss'

// Data
import { GlobalState } from 'js/data/GlobalState'
import { FILTERS } from 'js/data/Filters'

// Helpers
import { add, calculateTotals } from 'js/helpers/Statistics'
import fileSize from 'js/helpers/FileSize'
import Icon from 'js/helpers/Icon'

/**
 * Convert duration from minutes into milliseconds for the library and then print pretty human-readable time.
 */
function formatDuration(duration) {
    return prettyMilliseconds(duration * 60000, { verbose: true })
}

/**
 * Show all the ratings, number of anime per rating, and other totals.
 */
function Statistics() {
    const { state: { anime } } = useContext(GlobalState)
    const [ ref, inView, entry ] = useInView()

    // Do not render and do all this calculating if not in view and if scrolled upwards,
    // if downwards then keep the component because nothing is going to cause it to re-render and need
    // to preserve its height so the page doesn't jump
    if (!inView && entry && entry.boundingClientRect.y >= 0) {
        return <div className="statistics-placeholder" ref={ref} />
    }

    // No anime to display
    if (!anime.length) {
        return null
    }

    // How many anime there are for each of these data points
    const totals = {
        rating: calculateTotals(anime, 'rating', true),
        size: calculateTotals(anime, 'size'),
        episodes: calculateTotals(anime, 'episodes'),
        totalDuration: calculateTotals(anime, 'totalDuration'),
        watchTime: calculateTotals(anime, 'watchTime'),
    }

    // First and last non-zero values to exclude them from being shown
    // e.g. [0, 0, 1, 2, 0, 3, 4, 0] turns into [1, 2, 0, 3, 4]
    const firstNonZero = totals.rating.totals.slice(1).map(row => row.reduce(add)).findIndex(index => !!index) + 1

    const lastNonZero = totals.rating.totals.length - [ ...totals.rating.totals ]
        .reverse().map(row => row.reduce(add)).findIndex(index => !!index) - 1

    // Don't show stats if all shown anime are "planned"
    if (firstNonZero + lastNonZero === 0) {
        return null
    }

    return (
        <div className="statistics has-text-centered" ref={ref}>
            <div className="columns is-mobile">
                <div className="column is-2-mobile is-1-tablet is-rating">
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
            {[ ...Array(10) ].map((value, index) => index + 1).slice(firstNonZero - 1, lastNonZero).reverse()
                .map(rating =>
                    <StatisticsRow rating={rating} key={rating} totals={totals} />
                )}
            {firstNonZero !== lastNonZero &&
                <div className="columns is-mobile">
                    <div className="column is-2-mobile is-1-tablet is-rating">
                        <h6>Totals</h6>
                    </div>
                    <div className="column">
                        Mean Rating: {totals.rating.average
                            ? (Math.round(totals.rating.average * 100) / 100).toLocaleString()
                            : 'N/A'
                        }
                    </div>
                    <div className="column">
                        {totals.size.sum ? fileSize(totals.size.sum) : <>&mdash;</>}
                    </div>
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
            }
        </div>
    )
}

/**
 * Row of statistics for a single rating.
 */
function StatisticsRow({ rating, totals: { rating: ratingTotals, size, episodes, totalDuration, watchTime } }) {
    return (
        <div className="columns is-mobile">
            <div className="column is-2-mobile is-1-tablet is-rating">
                <span>{rating}<Icon icon={[ 'fas', 'star' ]} className="is-small" /></span>
            </div>
            <StatisticsColumn rating={rating} data={ratingTotals} showPercentage={true} />
            <StatisticsColumn rating={rating} data={size} formatFunction={fileSize} />
            <StatisticsColumn rating={rating} data={episodes} />
            <StatisticsColumn rating={rating} data={totalDuration} formatFunction={formatDuration} />
            <StatisticsColumn rating={rating} data={watchTime} formatFunction={formatDuration} />
        </div>
    )
}

/**
 * Column of statistics for specific data within a rating. Accepts a format function to modify output.
 */
function StatisticsColumn({ rating, data, formatFunction, showPercentage }) {
    // Total of this data for this rating
    const ratingData = data.totals[rating]
    const sum = ratingData.reduce(add)

    // Nothing to show
    if (!sum) {
        return <div className="column">&mdash;</div>
    }

    // Draw a part of the progress bar in the correct color for each status of anime
    return (
        <div className="column">
            {formatFunction ? formatFunction(sum) : sum.toLocaleString()}
            {!!showPercentage && sum !== data.count && ` (${Math.round((sum / data.count) * 100).toLocaleString()}%)`}
            <div className="progress is-flex has-background-grey-lighter">
                {ratingData.map((singleData, status) => {
                    if (!singleData) {
                        return null
                    }

                    const count = formatFunction ? formatFunction(singleData) : singleData

                    return (
                        <div
                            title={`${FILTERS.status.descriptions[status]} (${count})`}
                            className={`has-background-${FILTERS.status.colorCodes[status]}`}
                            style={{ width: `${data.max ? (singleData / data.max) * 100 : 0}%` }}
                            key={`${rating}-${status}`}
                        />
                    )
                })}
            </div>
        </div>
    )
}

// Exports
export default Statistics
