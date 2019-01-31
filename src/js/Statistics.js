// Libraries
// import PrettyTime from './PrettyTime'
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
    allRatings = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1]

    render() {
        const { anime } = this.props

        // No anime to display
        if (!anime.length) {
            return null
        }

        // How many anime there are for each rating
        let ratingsTotals = [...Array(11)].map(() => Array(7).fill(0))
        anime.forEach(anime => ratingsTotals[anime.rating][anime.status]++)

        // Rating with the most anime in it, ignoring unrated
        const biggestRating = Math.max(...ratingsTotals.slice(1).map(n => n.reduce(add)))

        // Total combined rating and total non-zero rated anime used to calculate the average
        const totalRating = !!biggestRating && anime.map(anime => anime.rating).reduce(add)
        const totalRated = !!biggestRating && ratingsTotals.slice(1).map(n => n.reduce(add)).reduce(add)

        // First and last non-zero values to exclude them from being shown
        // e.g. [0, 0, 1, 2, 0, 3, 4, 0] => [1, 2, 0, 3, 4]
        const firstNonZero = ratingsTotals.slice(1).map(n => n.reduce(add)).findIndex(i => !!i) + 1
        const lastNonZero = ratingsTotals.length - Object.values(Object.assign([], ratingsTotals)).reverse().map(n => n.reduce(add)).findIndex(i => !!i) - 1

        // Don't show stats if all shown anime are "planned"
        if (firstNonZero + lastNonZero === 0) {
            return null
        }

        // Total storage size per rating per episode
        let sizeTotals = [...Array(11)].map(() => Array(7).fill(0))
        anime.forEach(anime => sizeTotals[anime.rating][anime.status] += anime.size)

        // Biggest size among the ratings, ignoring unrated
        const biggestSize = Math.max(...sizeTotals.slice(1).map(n => n.reduce(add)))

        // Total episode count per rating per status
        let episodeTotals = [...Array(11)].map(() => Array(7).fill(0))
        anime.forEach(anime => episodeTotals[anime.rating][anime.status] += anime.episodes)

        // Most number of episodes among the ratings, ignoring unrated
        const biggestEpisodes = Math.max(...episodeTotals.slice(1).map(n => n.reduce(add)))

        // Totals row
        let totals = {
            size: 0,
            episodes: 0,
        }

        // Add up all the needed values, filtered by a rating if there is any
        anime.filter(anime => !!anime.rating).forEach(anime => {
            totals.size += anime.size
            totals.episodes += anime.episodes
        })

        return (
            <div className="container-fluid container-limited statistics">
                <hr />
                <div className="row justify-content-center align-items-center border-row">
                    <div className="col-1 text-center">
                        <h6>Rating</h6>
                    </div>
                    <div className="col text-center">
                        <h6>Number of Anime</h6>
                    </div>
                    <div className="col text-center">
                        <h6>Total Storage Size</h6>
                    </div>
                    <div className="col text-center">
                        <h6>Total Number of Episodes</h6>
                    </div>
                </div>
                {this.allRatings.map((rating, index) => {
                    // Invert the index
                    index = 10 - index

                    // Exlude starting and ending empty ratings which not to show
                    if (index < firstNonZero || index > lastNonZero) {
                        return null
                    }

                    return (
                        <div className="row justify-content-center align-items-center" key={rating}>
                            <div className="col-1 text-center">
                                {rating}
                            </div>
                            <StatisticsColumn rating={rating} ratingData={ratingsTotals[rating]} biggestData={biggestRating} />
                            <StatisticsColumn rating={rating} ratingData={sizeTotals[rating]} biggestData={biggestSize} formatFunction={FileSize} />
                            <StatisticsColumn rating={rating} ratingData={episodeTotals[rating]} biggestData={biggestEpisodes} />
                        </div>
                    )
                })}
                {firstNonZero !== lastNonZero &&
                    <div className="row justify-content-center align-items-center border-row">
                        <div className="col-1 text-center">
                            <h6>Totals</h6>
                        </div>
                        <div className="col text-center">
                            Average Rating: {biggestRating ? Round(totalRating / totalRated, 2) : 'N/A'}
                        </div>
                        <div className="col text-center">
                            {totals.size ? FileSize(totals.size) : <Fragment>&ndash;</Fragment>}
                        </div>
                        <div className="col text-center">
                            {totals.episodes ? totals.episodes : <Fragment>&ndash;</Fragment>}
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
        const { rating, ratingData, biggestData, formatFunction } = this.props

        // Total sum of all data
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
                            title={`${Data.lookup.status[status]} (${formatFunction ? formatFunction(singleData) : singleData})`}
                            className={`progress-bar bg-${Data.lookup.statusColor[status]}`}
                            style={{ width: `${biggestData ? ((singleData / biggestData) * 100) : 0}%` }}
                            key={`${rating}-${status}`}
                        />
                    )}
                </div>
            </div>
        )
    }
}