import React from 'react'

import 'src/styles/Statistics.scss'

import { FILTERS } from 'src/data/Filters'

import { formatDuration } from 'src/helpers/Generic'
import fileSize from 'src/helpers/FileSize'

import StatisticsColumn from 'src/components/statistics/StatisticsColumn'

/**
 * Row of statistics for a single rating.
 */
export default function StatisticsRow({ rating, totals }) {
    const { rating: ratingTotals, size, episodes, totalDuration, watchTime } = totals

    return (
        <div className="columns is-mobile">
            <div className="column is-2-mobile is-1-tablet is-rating">
                <span>{FILTERS.rating.tinyDescriptions[rating]}</span>
            </div>
            <StatisticsColumn rating={rating} data={ratingTotals} showPercentage />
            <StatisticsColumn rating={rating} data={size} formatFunction={fileSize} />
            <StatisticsColumn rating={rating} data={episodes} />
            <StatisticsColumn rating={rating} data={totalDuration} formatFunction={formatDuration} />
            <StatisticsColumn rating={rating} data={watchTime} formatFunction={formatDuration} />
        </div>
    )
}
