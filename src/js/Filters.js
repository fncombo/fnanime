// React
import React, { Component, PureComponent, Fragment } from 'react'

// Style
import '../css/Filters.css'

// Components
import Data from './Data'

// Filters, search, and reset
export default class Filters extends Component {
    render() {
        const { anime, searchQuery, update, reset, activeFilters, isDetailView } = this.props

        return (
            <div className="row">
                <FilterGroup anime={anime} filterName="rating" activeFilters={activeFilters} update={update} fullWidth={true} />
                <FilterGroup anime={anime} filterName="type" activeFilters={activeFilters} update={update} />
                {isDetailView && <FilterGroup anime={anime} filterName="resolution" activeFilters={activeFilters} update={update} />}
                {!isDetailView && <FilterGroup anime={anime} filterName="status" activeFilters={activeFilters} update={update} />}
                {isDetailView &&
                    <Fragment>
                        <FilterGroup anime={anime} filterName="status" activeFilters={activeFilters} update={update} />
                        <FilterGroup anime={anime} filterName="videoCodec" activeFilters={activeFilters} update={update} />
                        <FilterGroup anime={anime} filterName="source" activeFilters={activeFilters} update={update} />
                        <FilterGroup anime={anime} filterName="audioCodec" activeFilters={activeFilters} update={update} />
                    </Fragment>
                }
                <div className={`mt-3 ${isDetailView ? 'col-3' : 'col-6'}`}>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search by anime title..."
                        value={searchQuery}
                        onChange={event => update('searchQuery', event.target.value)}
                        autoFocus={true}
                    />
                </div>
                {isDetailView &&
                    <div className="col-3 mt-3">
                        <select className="custom-select" value={activeFilters.subs} onChange={event => update('activeFilters', 'subs', event.target.value)}>
                            <OptionGroup anime={anime} filterName="subs" />
                        </select>
                    </div>
                }
                <div className="col-5 mt-3 d-flex align-items-center justify-content-center">
                    <span>
                        <Summary anime={anime} isDetailView={isDetailView} />
                    </span>
                </div>
                <div className="col-1 mt-3 d-flex">
                    <button className="btn btn-primary flex-grow-1" onClick={reset}>Reset</button>
                </div>
            </div>
        )
    }
}

// A group of buttons for a single filter
class FilterGroup extends Component {
    render() {
        const { anime, filterName, activeFilters, update, fullWidth } = this.props

        return (
            <div className={fullWidth ? 'col-12 mt-3' : 'col-6 mt-3'}>
                <div className="btn-group d-flex">
                    {Data.filters[filterName].values.map(filterValue => {
                        // Count how many of currently shown anime match this filter
                        const count = filterValue === false ? 0 : anime.filter(anime => anime[filterName] === filterValue).length

                        // Whether this button is currently selected
                        const currentlySelected = activeFilters[filterName] === filterValue

                        return (
                            <button
                                className={`btn ${currentlySelected ? 'btn-secondary' : 'btn-outline-secondary'}`}
                                onClick={!currentlySelected ? () => update('activeFilters', filterName, filterValue) : undefined}
                                key={filterValue}
                            >
                                {Data.filters[filterName].descriptions[filterValue]}{!!count && <span> ({count})</span>}
                            </button>
                        )
                    })}
                </div>
            </div>
        )
    }
}

// A list of <option>s for use in <select>
class OptionGroup extends Component {
    render() {
        const { filterName, anime } = this.props

        let options = []

        Data.filters[filterName].values.forEach(filterValue => {
            // Count how many of currently shown anime match this filter
            const count = anime.filter(anime => anime[filterName] === filterValue).length

            options.push(
                <option value={filterValue} key={filterValue}>
                    {filterValue ? `${filterValue}${count > 0 ? ` (${count})` : ''}` : Data.filters[filterName].descriptions[filterValue]}
                </option>
            )
        })

        return options
    }
}

// Stats of what the table curently shows
class Summary extends PureComponent {
    render() {
        const { anime, isDetailView } = this.props

        if (!anime.length) {
            return null
        }

        const downloadedCount = anime.filter(anime => !!anime.size).length
        const notDownloadedCount = anime.length - downloadedCount

        if (!isDetailView) {
            return <Fragment>Found {downloadedCount + notDownloadedCount} anime</Fragment>
        }

        if (downloadedCount && notDownloadedCount) {
            return <Fragment>Found <strong>{downloadedCount}</strong> +{notDownloadedCount} anime</Fragment>

        } else if (downloadedCount && !notDownloadedCount) {
            return <Fragment>Found <strong>{downloadedCount}</strong> anime</Fragment>

        } else if (!downloadedCount && notDownloadedCount) {
            return <Fragment>Found {notDownloadedCount}  anime</Fragment>
        }
    }
}
