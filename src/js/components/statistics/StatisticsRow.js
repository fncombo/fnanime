// React
import React from 'react'

// Style
import 'scss/Statistics.scss'

// Data
import { FILTERS } from 'js/data/Filters'

// Helpers
import { formatDuration } from 'js/helpers/Generic'
import fileSize from 'js/helpers/FileSize'

// Components
import StatisticsColumn from 'js/components/statistics/StatisticsColumn'

/**
 * Row of statistics for a single rating.
 */
export default function StatisticsRow({ rating, totals }) {
    const { rating: ratingTotals, size, episodes, totalDuration, watchTime } = totals

    return (
        <div className="columns is-mobile">
            <div className="column is-2-mobile is-1-tablet is-rating">
                <span>
                    {FILTERS.rating.tinyDescriptions[rating]}
                </span>
            </div>
            <StatisticsColumn rating={rating} data={ratingTotals} showPercentage={true} />
            <StatisticsColumn rating={rating} data={size} formatFunction={fileSize} />
            <StatisticsColumn rating={rating} data={episodes} />
            <StatisticsColumn rating={rating} data={totalDuration} formatFunction={formatDuration} />
            <StatisticsColumn rating={rating} data={watchTime} formatFunction={formatDuration} />
        </div>
    )
}
