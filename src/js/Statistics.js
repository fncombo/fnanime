// Libraries
import FileSize from 'filesize'
import { round as Round } from 'math-precision'

// React
import React, { Component, PureComponent, Fragment } from 'react'

// Style
import '../css/Statistics.css'

// Components
import Data from './Data'

// Reducer to add all values in an array
const add = (a, b) => a + b

// Show all the ratings, number of anime per rating, and other totals
export default class Statistics extends Component {
    totals(data, countOnly) {
        const { anime } = this.props

        // Create a 2D array to store each status within each rating
        let totals = [...Array(11)].map(() => Array(7).fill(0))

        // Increment the number of anime or add up the data
        anime.forEach(anime => totals[anime.rating][anime.status] += countOnly ? 1 : anime[data])

        const sum = anime.map(anime => anime[data]).reduce(add)
        const count = totals.slice(1).map(n => n.reduce(add)).reduce(add)

        return {
            totals,
            max: Math.max(...totals.slice(1).map(n => n.reduce(add))),
            sum,
            count,
            average: sum / count,
        }
    }

    render() {
        const { anime, isDetailView } = this.props

        // No anime to display
        if (!anime.length) {
            return null
        }

        // How many anime there are for each of these data points
        const ratingTotals = this.totals('rating', true)
        const sizeTotals = this.totals('size')
        const episodeTotals = this.totals('episodes')

        // First and last non-zero values to exclude them from being shown
        // e.g. [0, 0, 1, 2, 0, 3, 4, 0] turns into [1, 2, 0, 3, 4]
        const firstNonZero = ratingTotals.totals.slice(1).map(n => n.reduce(add)).findIndex(i => !!i) + 1
        const lastNonZero = ratingTotals.totals.length - Object.values(Object.assign([], ratingTotals.totals)).reverse().map(n => n.reduce(add)).findIndex(i => !!i) - 1

        // // Don't show stats if all shown anime are "planned"
        if (firstNonZero + lastNonZero === 0) {
            return null
        }

        return (
            <div className="container-fluid container-limited statistics">
                <hr />
                <div className="row mt-2 mb-3 justify-content-center align-items-center">
                    <div className="col-1 text-center">
                        <h6 className="m-0">Rating</h6>
                    </div>
                    <div className="col text-center">
                        <h6 className="m-0">Number of Anime</h6>
                    </div>
                    {isDetailView &&
                        <div className="col text-center">
                            <h6 className="m-0">Total Storage Size</h6>
                        </div>
                    }
                    <div className="col text-center">
                        <h6 className="m-0">Total Number of Episodes</h6>
                    </div>
                </div>
                {Array.from(Array(10), (value, i) => i + 1).slice(firstNonZero - 1, lastNonZero).reverse().map(rating => {
                    return (
                        <div className="row row-striped py-2 justify-content-center align-items-center" key={rating}>
                            <div className="col-1 text-center">
                                {rating}
                            </div>
                            <StatisticsColumn rating={rating} data={ratingTotals} />
                            {isDetailView && <StatisticsColumn rating={rating} data={sizeTotals} formatFunction={FileSize} />}
                            <StatisticsColumn rating={rating} data={episodeTotals} />
                        </div>
                    )
                })}
                {firstNonZero !== lastNonZero &&
                    <div className="row mt-3 mb-2 justify-content-center align-items-center">
                        <div className="col-1 text-center">
                            <h6 className="m-0">Totals</h6>
                        </div>
                        <div className="col text-center">
                            Average Rating: {ratingTotals.average ? Round(ratingTotals.average, 2) : 'N/A'}
                        </div>
                        {isDetailView &&
                            <div className="col text-center">
                                {sizeTotals.sum ? FileSize(sizeTotals.sum) : <Fragment>&ndash;</Fragment>}
                            </div>
                        }
                        <div className="col text-center">
                            {episodeTotals.sum ? episodeTotals.sum : <Fragment>&ndash;</Fragment>}
                        </div>
                    </div>
                }
                <hr />
            </div>
        )
    }
}

class StatisticsColumn extends PureComponent {
    render() {
        const { rating, data, formatFunction } = this.props

        const ratingData = data.totals[rating]
        const sum = ratingData.reduce(add)

        // Nothing to show
        if (!sum) {
            return <div className="col text-center">&ndash;</div>
        }

        return (
            <div className="col text-center">
                {formatFunction ? formatFunction(sum) : sum}
                <div className="progress bg-secondary">
                    {ratingData.map((singleData, status) => !!singleData &&
                        <div
                            title={`${Data.filters.status.descriptions[status]} (${formatFunction ? formatFunction(singleData) : singleData})`}
                            className={`progress-bar bg-${Data.filters.status.colorCodes[status]}`}
                            style={{ width: `${data.max ? ((singleData / data.max) * 100) : 0}%` }}
                            key={`${rating}-${status}`}
                        />
                    )}
                </div>
            </div>
        )
    }
}
