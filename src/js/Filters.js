// React
import React, { Component, PureComponent, Fragment } from 'react'

// Style
import '../css/Filters.css'

// Data
import data from './data.json'

// Filters, search, and reset
export default class Filters extends Component {
    render() {
        const { anime, searchQuery, update, reset, getFilters } = this.props

        return (
            <Fragment>
                <div className="row mt-3">
                    <FilterGroup anime={anime} filterName="rating" full={true} update={update} getFilters={getFilters} />
                </div>
                <div className="row mt-3">
                    <FilterGroup anime={anime} filterName="type" update={update} getFilters={getFilters} />
                    <FilterGroup anime={anime} filterName="status" update={update} getFilters={getFilters} />
                </div>
                <div className="row mt-3">
                    <FilterGroup anime={anime} filterName="resolution" update={update} getFilters={getFilters} />
                    <FilterGroup anime={anime} filterName="source" update={update} getFilters={getFilters} />
                </div>
                <div className="row mt-3">
                    <div className="col-3">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={event => update('searchQuery', event.target.value)}
                            autoFocus={true}
                        />
                    </div>
                    <div className="col-3">
                        <select
                            className="custom-select"
                            value={getFilters().subGroup}
                            onChange={event => update('filters', 'subGroup', event.target.value)}
                        >
                            <OptionGroup anime={anime} filterName="subGroup" />
                        </select>
                    </div>
                    <div className="col-5 d-flex align-items-center justify-content-center">
                        <Summary anime={anime} />
                    </div>
                    <div className="col-1 d-flex">
                        <button className="btn btn-primary" onClick={reset}>Reset</button>
                    </div>
                </div>
            </Fragment>
        )
    }
}

// Quick summary of the current table state
class Summary extends PureComponent {
    render() {
        const { anime } = this.props

        if (!anime.length) {
            return <Fragment>No matching anime</Fragment>
        }

        const downloadedCount = anime.filter(anime => anime.downloaded).length
        const notDownloadedCount = anime.length - downloadedCount

        if (downloadedCount && notDownloadedCount) {
            return <span>Showing <strong>{downloadedCount}</strong> (+{notDownloadedCount} not downloaded) anime</span>

        } else if (downloadedCount && !notDownloadedCount) {
            return <span>Showing <strong>{downloadedCount}</strong> anime</span>

        } else if (!downloadedCount && notDownloadedCount) {
            return <span>Showing {notDownloadedCount} not downloaded anime</span>
        }
    }
}

// A group of buttons for a single filter
class FilterGroup extends PureComponent {
    render() {
        const { anime, filterName, full, update, getFilters } = this.props

        // Width of all buttons in this group should be equal
        const width = 100 / data.filterValues[filterName].length

        return (
            <div className={full ? 'col-12' : 'col-6'}>
                <div className="btn-group d-flex">
                    {data.filterValues[filterName].map(value => {
                        // Count how many of currently shown anime match this filter and aren't "false" value
                        const count = anime.filter(anime => anime[filterName] === value && value).length

                        const currentlySelected = getFilters()[filterName] === value
                        const attributes = {
                            onClick: !currentlySelected ? () => update('filters', filterName, value) : undefined,
                        }

                        return (
                            <button
                                className={`btn btn-${currentlySelected ? 'primary' : 'secondary'}`}
                                style={{ width: `${width}%` }}
                                {...attributes}
                                key={value}
                            >
                                {data.lookup[filterName][value]}
                                {!!count && <span> ({count})</span>}
                            </button>
                        )
                    })}
                </div>
            </div>
        )
    }
}

// A list of <option>s for use in <select>
class OptionGroup extends PureComponent {
    render() {
        const { anime, filterName } = this.props

        let options = []

        data.filterValues[filterName].forEach(value => {
            // Count how many of currently shown anime match this option
            const count = anime.filter(anime => {
                return Array.isArray(anime[filterName]) && anime[filterName].indexOf(value) !== -1
            }).length

            // Don't include options with no matching anime to them
            if (!count && value) {
                return
            }

            options.push(
                <option value={value} key={value}>
                    {value ? value + (count && ` (${count})`) : data.lookup[filterName][value]}
                </option>
            )
        })

        return options
    }
}