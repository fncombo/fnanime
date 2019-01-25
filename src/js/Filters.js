// Libraries
import ClassNames from 'classnames'

// React
import React, { Component, PureComponent, Fragment } from 'react'

// Style
import '../css/Filters.css'

// Components
import Data from './Data'

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
        const width = 100 / Data.filterValues[filterName].length

        const colClasses = ClassNames({
            'col-12': full,
            'col-6': !full,
        })

        return (
            <div className={colClasses}>
                <div className="btn-group d-flex">
                    {Data.filterValues[filterName].map(value => {
                        // Count how many of currently shown anime match this filter and aren't "false" value
                        const count = anime.filter(anime => anime[filterName] === value && value).length

                        // Whether this button is currently selected
                        const currentlySelected = getFilters()[filterName] === value

                        // Special onclick function wow
                        const attributes = {
                            onClick: !currentlySelected ? () => update('filters', filterName, value) : undefined,
                        }

                        // Class
                        const buttonClasses = ClassNames('btn', {
                            'btn-primary': currentlySelected,
                            'btn-secondary': !currentlySelected,
                        })

                        return (
                            <button className={buttonClasses} style={{ width: `${width}%` }} {...attributes} key={value}>
                                {Data.lookup[filterName][value]}
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

        Data.filterValues[filterName].forEach(value => {
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
                    {value ? value + (count && ` (${count})`) : Data.lookup[filterName][value]}
                </option>
            )
        })

        return options
    }
}