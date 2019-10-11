// React
import React from 'react'

// Style
import 'scss/Statistics.scss'

// Data
import { FILTERS } from 'js/data/Filters'

// Helpers
import { formatDuration } from 'js/helpers/Statistics'
import fileSize from 'js/helpers/FileSize'

// Components
import Column from 'js/components/statistics/Column'

/**
 * Row of statistics for a single rating.
 */
function Row({ rating, totals: { rating: ratingTotals, size, episodes, totalDuration, watchTime } }) {
    return (
        <div className="columns is-mobile">
            <div className="column is-2-mobile is-1-tablet is-rating">
                <span>{FILTERS.rating.tinyDescriptions[rating]}</span>
            </div>
            <Column rating={rating} data={ratingTotals} showPercentage={true} />
            <Column rating={rating} data={size} formatFunction={fileSize} />
            <Column rating={rating} data={episodes} />
            <Column rating={rating} data={totalDuration} formatFunction={formatDuration} />
            <Column rating={rating} data={watchTime} formatFunction={formatDuration} />
        </div>
    )
}

export default Row
