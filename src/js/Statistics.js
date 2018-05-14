// Libraries
import filesize from 'filesize'
import { round } from 'math-precision'

// React
import React, { Component, PureComponent, Fragment } from 'react'

// Style
import '../css/Statistics.css'

// Helpers
import prettyTime from './PrettyTime'

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
        let ratingCounts = new Array(11).fill(0)
        anime.forEach(anime => ratingCounts[anime.rating]++)

        // Rating with the most anime in it, ignoring unrated
        const topRating = Math.max(...ratingCounts.slice(1))

        // Total combined rating and total non-zero rated anime used to calculate the average
        const totalRating = !!topRating && anime.map(anime => anime.rating).reduce((a, b) => a + b)
        const totalRated = !!topRating && ratingCounts.slice(1).reduce((a, b) => a + b)

        // First and last non-zero values to exclude them from being shown
        // e.g. [0, 0, 1, 2, 0, 3, 4, 0] => [1, 2, 0, 3, 4]
        let firstNonZero = ratingCounts.slice(1).findIndex(i => !!i) + 1
        let lastNonZero = ratingCounts.length - Object.values(Object.assign([], ratingCounts)).reverse().findIndex(i => !!i) - 1

        // Total sizes per rating
        let sizeTotals = new Array(11).fill(0)
        anime.forEach(anime => sizeTotals[anime.rating] += anime.size)
        const biggestSize = Math.max(...sizeTotals.slice(1))

        // Total durations per rating
        let durationTotals = new Array(11).fill(0)
        anime.forEach(anime => durationTotals[anime.rating] += anime.duration * anime.episodes)
        const longestDuration = Math.max(...durationTotals.slice(1))

        // Total watch times per rating
        let watchTimeTotals = new Array(11).fill(0)
        anime.forEach(anime => watchTimeTotals[anime.rating] += (anime.duration * anime.watchedEpisodes) * (anime.rewatchCount + 1))
        const longestWatchTime = Math.max(...watchTimeTotals.slice(1))

        // Total episode count per rating
        let episodeTotals = new Array(11).fill(0)
        anime.forEach(anime => episodeTotals[anime.rating] += anime.episodes)
        const biggestEpisodes = Math.max(...episodeTotals.slice(1))

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
                        <StatisticsRow
                            rating={rating}
                            ratingCounts={ratingCounts}
                            topRating={topRating}
                            sizeTotals={sizeTotals}
                            biggestSize={biggestSize}
                            durationTotals={durationTotals}
                            longestDuration={longestDuration}
                            watchTimeTotals={watchTimeTotals}
                            longestWatchTime={longestWatchTime}
                            episodeTotals={episodeTotals}
                            biggestEpisodes={biggestEpisodes}
                            key={rating}
                        />
                    )
                })}
                <div className="row justify-content-center align-items-center border-row">
                    <div className="col-1 text-center">
                        <h6>Totals</h6>
                    </div>
                    <div className="col text-center">
                        Average Rating: {topRating ? round(totalRating / totalRated, 2) : 'N/A'}
                    </div>
                    <StatisticsTotals anime={anime} />
                </div>
                <hr />
            </div>
        )
    }
}

// Single row with the relative progress bar and totals
class StatisticsRow extends PureComponent {
    render() {
        const { rating,
            ratingCounts, topRating,
            sizeTotals, biggestSize,
            durationTotals, longestDuration,
            watchTimeTotals, longestWatchTime,
            episodeTotals, biggestEpisodes
        } = this.props

        return (
            <div className="row justify-content-center align-items-center">
                <div className="col-1 text-center">
                    {rating}
                </div>
                <StatisticsColumn rating={rating} data={ratingCounts} biggestData={topRating} />
                <StatisticsColumn rating={rating} data={sizeTotals} biggestData={biggestSize} formatFunction={filesize} />
                <StatisticsColumn rating={rating} data={durationTotals} biggestData={longestDuration} formatFunction={prettyTime} />
                <StatisticsColumn rating={rating} data={watchTimeTotals} biggestData={longestWatchTime} formatFunction={prettyTime} />
                <StatisticsColumn rating={rating} data={episodeTotals} biggestData={biggestEpisodes} />
            </div>
        )
    }
}

class StatisticsColumn extends PureComponent {
    render() {
        const { rating, data, biggestData, formatFunction } = this.props

        return (
            <div className="col text-center">
                {!!data[rating] ? (
                    <Fragment>
                        {formatFunction ? formatFunction(data[rating]) : data[rating]}
                        <div className="progress bg-secondary">
                            <div
                                className="progress-bar bg-primary"
                                style={{width: `${biggestData ? ((data[rating] / biggestData) * 100) : 0}%`}}
                            >
                            </div>
                        </div>
                    </Fragment>
                ) : <Fragment>&mdash;</Fragment>}
            </div>
        )
    }
}

// Totals columns for the filtered anime
class StatisticsTotals extends PureComponent {
    render() {
        const { anime, rating } = this.props

        let totals = {
            size: 0,
            episodes: 0,
            duration: 0,
            watchTime: 0,
        }

        // Add up all the needed values, filtered by a rating if there is any
        anime.filter(anime => rating ? anime.rating === rating : true).forEach(anime => {
            totals.size += anime.size
            totals.episodes += anime.episodes
            totals.duration += anime.duration * anime.episodes
            totals.watchTime += (anime.duration * anime.watchedEpisodes) * (anime.rewatchCount + 1)
        })

        return (
            <Fragment>
                <div className="col text-center">
                    {totals.size ? filesize(totals.size) : <Fragment>&mdash;</Fragment>}
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
            </Fragment>
        )
    }
}