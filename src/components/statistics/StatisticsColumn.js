import React from 'react'

import 'src/styles/Statistics.scss'

import { FILTERS } from 'src/data/Filters'

import { add } from 'src/helpers/Statistics'

/**
 * Column of statistics for specific data within a rating. Accepts a format function to modify data.
 */
export default function StatisticsColumn({ rating, data, formatFunction, showPercentage }) {
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
            {!!showPercentage &&
                sum !== data.count &&
                !!rating &&
                ` (${Math.round((sum / data.count) * 100).toLocaleString()}%)`}
            <div className="progress is-flex has-background-grey-lighter">
                {ratingData.map((singleData, status) => {
                    if (!singleData) {
                        return null
                    }

                    const count = formatFunction ? formatFunction(singleData) : singleData.toLocaleString()

                    return (
                        <div
                            title={`${FILTERS.status.descriptions[status]} (${count})`}
                            className={`has-background-${FILTERS.status.colorCodes[status]}`}
                            style={{ width: `${data.max ? (singleData / data.max) * 100 : 0}%` }}
                            // eslint-disable-next-line react/no-array-index-key
                            key={`${rating}-${status}`}
                        />
                    )
                })}
            </div>
        </div>
    )
}
