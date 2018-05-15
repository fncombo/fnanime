// Libraries
import FileSize from 'filesize'
import { round } from 'math-precision'

// React
import React, { Component, PureComponent, Fragment } from 'react'

// Style
import '../css/Statistics.css'

// Data
import data from './data.json'

// Helpers
import prettyTime from './PrettyTime'

// Reduce function
const reducer = (a, b) => a + b

// Show all the ratings, number of anime per rating, and other totals
// Arrays are done that way so they are all unique and don't cross-reference each other when modifying
export default class Statistics extends Component {
    allRatings = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1]

    render() {
        const { anime } = this.props

        // No anime to display
        if (!anime.length) {
            return null
        }

        // How many anime there are for each rating
        let ratingsTotals = [
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0]
        ]
        anime.forEach(anime => ratingsTotals[anime.rating][anime.status]++)

        // Rating with the most anime in it, ignoring unrated
        const biggestRating = Math.max(...ratingsTotals.slice(1).map(n => n.reduce(reducer)))

        // Total combined rating and total non-zero rated anime used to calculate the average
        const totalRating = !!biggestRating && anime.map(anime => anime.rating).reduce(reducer)
        const totalRated = !!biggestRating && ratingsTotals.slice(1).map(n => n.reduce(reducer)).reduce(reducer)

        // First and last non-zero values to exclude them from being shown
        // e.g. [0, 0, 1, 2, 0, 3, 4, 0] => [1, 2, 0, 3, 4]
        let firstNonZero = ratingsTotals.slice(1).map(n => n.reduce(reducer)).findIndex(i => !!i) + 1
        let lastNonZero = ratingsTotals.length - Object.values(Object.assign([], ratingsTotals)).reverse().map(n => n.reduce(reducer)).findIndex(i => !!i) - 1

        // Total storage size per rating per episode
        let sizeTotals = [
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0]
        ]
        anime.forEach(anime => sizeTotals[anime.rating][anime.status] += anime.size)
        const biggestSize = Math.max(...sizeTotals.slice(1).map(n => n.reduce(reducer)))

        // Total durations per rating per status
        let durationTotals = [
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0]
        ]
        anime.forEach(anime => durationTotals[anime.rating][anime.status] += anime.duration * anime.episodes)
        const biggestDuration = Math.max(...durationTotals.slice(1).map(n => n.reduce(reducer)))

        // Total watch times per rating per status
        let watchTimeTotals = [
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0]
        ]
        anime.forEach(anime => watchTimeTotals[anime.rating][anime.status] += (anime.duration * anime.watchedEpisodes) * (anime.rewatchCount + 1))
        const biggestWatchTime = Math.max(...watchTimeTotals.slice(1).map(n => n.reduce(reducer)))

        // Total episode count per rating per status
        let episodeTotals = [
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0]
        ]
        anime.forEach(anime => episodeTotals[anime.rating][anime.status] += anime.episodes)
        const biggestEpisodes = Math.max(...episodeTotals.slice(1).map(n => n.reduce(reducer)))

        // Totals row
        let totals = {
            size: 0,
            episodes: 0,
            duration: 0,
            watchTime: 0,
        }

        // Add up all the needed values, filtered by a rating if there is any
        anime.filter(anime => !!anime.rating).forEach(anime => {
            totals.size += anime.size
            totals.episodes += anime.episodes
            totals.duration += anime.duration * anime.episodes
            totals.watchTime += (anime.duration * anime.watchedEpisodes) * (anime.rewatchCount + 1)
        })

        return (
            <div className="container-fluid statistics">
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
                        <h6>Total Duration</h6>
                    </div>
                    <div className="col text-center">
                        <h6>Total Watch Time</h6>
                    </div>
                    <div className="col text-center">
                        <h6>Total Number of Episodes</h6>
                    </div>
                </div>
                {this.allRatings.map((rating, index) => {
                    // Invert the index and exlude ratings which not to show
                    index = 10 - index
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
                            <StatisticsColumn rating={rating} ratingData={durationTotals[rating]} biggestData={biggestDuration} formatFunction={prettyTime} />
                            <StatisticsColumn rating={rating} ratingData={watchTimeTotals[rating]} biggestData={biggestWatchTime} formatFunction={prettyTime} />
                            <StatisticsColumn rating={rating} ratingData={episodeTotals[rating]} biggestData={biggestEpisodes} />
                    </  div>
                    )
                })}
                <div className="row justify-content-center align-items-center border-row">
                    <div className="col-1 text-center">
                        <h6>Totals</h6>
                    </div>
                    <div className="col text-center">
                        Average Rating: {biggestRating ? round(totalRating / totalRated, 2) : 'N/A'}
                    </div>
                    <div className="col text-center">
                        {totals.size ? FileSize(totals.size) : <Fragment>&mdash;</Fragment>}
                    </div>
                    <div className="col text-center">
                        {totals.duration ? prettyTime(totals.duration, 'm') : <Fragment>&mdash;</Fragment>}
                    </div>
                    <div className="col text-center">
                        {totals.watchTime ? prettyTime(totals.watchTime, 'm') : <Fragment>&mdash;</Fragment>}
                    </div>
                    <div className="col text-center">
                        {totals.episodes ? totals.episodes : <Fragment>&mdash;</Fragment>}
                    </div>
                </div>
                <hr />
            </div>
        )
    }
}

class StatisticsColumn extends PureComponent {
    render() {
        const { rating, ratingData, biggestData, formatFunction } = this.props

        // Total sum of all status's data for this rating
        const sum = ratingData.reduce(reducer)

        return (
            <div className="col text-center">
                {sum ? (
                    <Fragment>
                        {formatFunction ? formatFunction(sum) : sum}
                        <div className="progress bg-secondary">
                            {ratingData.map((singleData, status) =>
                                !!singleData &&
                                <div
                                    title={data.lookup.status[status]}
                                    className={`progress-bar bg-${data.lookup.statusColor[status]}`}
                                    style={{width: `${biggestData ? ((singleData / biggestData) * 100) : 0}%`}}
                                    key={`${rating}-${status}`}
                                />
                            )}
                        </div>
                    </Fragment>
                ) : <Fragment>&mdash;</Fragment>}
            </div>
        )
    }
}