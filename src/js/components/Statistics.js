// React
import React, { useContext } from 'react'

// Libraries
import FileSize from 'filesize'
import { useInView } from 'react-intersection-observer'

// Style
import '../../css/Statistics.css'

// Data
import { GlobalState } from '../data/GlobalState'
import { Filters } from '../data/Filters'

// Helpers
import { add, calculateTotals } from '../helpers/Statistics'

/**
 * Show all the ratings, number of anime per rating, and other totals.
 */
function Statistics() {
    const { state: { anime} } = useContext(GlobalState)
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
        episode: calculateTotals(anime, 'episodes'),
    }

    // First and last non-zero values to exclude them from being shown
    // e.g. [0, 0, 1, 2, 0, 3, 4, 0] turns into [1, 2, 0, 3, 4]
    const firstNonZero = totals.rating.totals.slice(1).map(n => n.reduce(add)).findIndex(i => !!i) + 1

    const lastNonZero = totals.rating.totals.length - [...totals.rating.totals]
        .reverse()
        .map(n => n.reduce(add)).findIndex(i => !!i) - 1

    // Don't show stats if all shown anime are "planned"
    if (firstNonZero + lastNonZero === 0) {
        return null
    }

    return (
        <div className="container-fluid container-limited statistics my-3" ref={ref}>
            <div className="row my-3 justify-content-center align-items-center">
                <div className="col-1 text-center">
                    <h6 className="m-0">Rating</h6>
                </div>
                <div className="col text-center">
                    <h6 className="m-0">Number of Anime</h6>
                </div>
                <div className="col text-center">
                    <h6 className="m-0">Total Storage Size</h6>
                </div>
                <div className="col text-center">
                    <h6 className="m-0">Total Number of Episodes</h6>
                </div>
            </div>
            {[...Array(10)].map((value, i) => i + 1).slice(firstNonZero - 1, lastNonZero).reverse().map(rating =>
                <StatisticsRow rating={rating} key={rating} totals={totals} />
            )}
            {firstNonZero !== lastNonZero &&
                <div className="row my-3 justify-content-center align-items-center">
                    <div className="col-1 text-center">
                        <h6 className="m-0">Totals</h6>
                    </div>
                    <div className="col text-center">
                        Average Rating: {totals.rating.average ? Math.round(totals.rating.average * 100) / 100 : 'N/A'}
                    </div>
                    <div className="col text-center">
                        {totals.size.sum ? FileSize(totals.size.sum) : <>&mdash;</>}
                    </div>
                    <div className="col text-center">
                        {totals.episode.sum ? totals.episode.sum : <>&mdash;</>}
                    </div>
                </div>
            }
        </div>
    )
}

/**
 * Row of statistics for a single rating.
 */
function StatisticsRow({ rating, totals: { rating: ratingTotals, size, episode } }) {
    return (
        <div className="row row-striped py-2 justify-content-center align-items-center">
            <div className="col-1 text-center">
                {rating}
            </div>
            <StatisticsColumn rating={rating} data={ratingTotals} />
            <StatisticsColumn rating={rating} data={size} formatFunction={FileSize} />
            <StatisticsColumn rating={rating} data={episode} />
        </div>
    )
}

/**
 * Column of statistics for specific data within a rating. Accepts a format function to modify output.
 */
function StatisticsColumn({ rating, data, formatFunction }) {
    // Total of this data for this rating
    const ratingData = data.totals[rating]
    const sum = ratingData.reduce(add)

    // Nothing to show
    if (!sum) {
        return <div className="col text-center">&mdash;</div>
    }

    // Draw a part of the progress bar in the correct color for each status of anime
    return (
        <div className="col text-center">
            {formatFunction ? formatFunction(sum) : sum}
            <div className="progress bg-secondary">
                {ratingData.map((singleData, status) => {
                    if (!singleData) {
                        return null
                    }

                    const count = formatFunction ? formatFunction(singleData) : singleData

                    return (
                        <div
                            title={`${Filters.status.descriptions[status]} (${count})`}
                            className={`progress-bar bg-${Filters.status.colorCodes[status]}`}
                            style={{ width: `${data.max ? ((singleData / data.max) * 100) : 0}%` }}
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
