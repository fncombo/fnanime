import React from 'react'
import PropTypes from 'prop-types'

import fileSize from 'src/helpers/file-size'
import { FILTERS } from 'src/helpers/filters'
import { formatDuration, PROP_TYPES } from 'src/helpers/generic'

import StatisticsColumn from 'src/components/statistics/StatisticsColumn'

import 'src/styles/Statistics.scss'

/**
 * Row of statistics for a single rating.
 */
export default function StatisticsRow({
    rating,
    totals: { rating: ratingTotals, size, episodes, totalDuration, watchTime },
}) {
    return (
        <div className="columns is-mobile">
            <div className="column is-2-mobile is-1-tablet is-rating">
                <span>{FILTERS.rating.tinyDescriptions[rating]}</span>
            </div>
            <StatisticsColumn rating={rating} data={ratingTotals} hasPercentage />
            <StatisticsColumn rating={rating} data={size} formatFunction={fileSize} />
            <StatisticsColumn rating={rating} data={episodes} />
            <StatisticsColumn rating={rating} data={totalDuration} formatFunction={formatDuration} />
            <StatisticsColumn rating={rating} data={watchTime} formatFunction={formatDuration} />
        </div>
    )
}

StatisticsRow.propTypes = {
    rating: PropTypes.number.isRequired,
    totals: PropTypes.exact({
        rating: PROP_TYPES.STATISTICS.isRequired,
        size: PROP_TYPES.STATISTICS.isRequired,
        episodes: PROP_TYPES.STATISTICS.isRequired,
        totalDuration: PROP_TYPES.STATISTICS.isRequired,
        watchTime: PROP_TYPES.STATISTICS.isRequired,
    }).isRequired,
}
