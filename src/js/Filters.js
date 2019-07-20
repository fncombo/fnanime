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

        // Array of names of all filters
        const filterNames = Object.keys(Data.filters)

        // Make a default nested object of filter values for each filter name that starts counting at 0
        const filterCounts = filterNames.reduce((object, filterName) => {
            object[filterName] = Data.filters[filterName].values.reduce((object, filterValue) => {
                object[filterValue] = 0
                return object
            }, {})

            return object
        }, {})

        // Count how many anime match each filter
        anime.forEach(anime => {
            filterNames.forEach(filterName => {
                filterCounts[filterName][anime[filterName]]++
            })
        })

        return (
            <div className="row">
                <FilterGroup filterCounts={filterCounts} filterName="rating" activeFilters={activeFilters} update={update} fullWidth={true} />
                <FilterGroup filterCounts={filterCounts} filterName="type" activeFilters={activeFilters} update={update} />
                {isDetailView && <FilterGroup filterCounts={filterCounts} filterName="resolution" activeFilters={activeFilters} update={update} />}
                {!isDetailView && <FilterGroup filterCounts={filterCounts} filterName="status" activeFilters={activeFilters} update={update} />}
                {isDetailView &&
                    <Fragment>
                        <FilterGroup filterCounts={filterCounts} filterName="status" activeFilters={activeFilters} update={update} />
                        <FilterGroup filterCounts={filterCounts} filterName="videoCodec" activeFilters={activeFilters} update={update} />
                        <FilterGroup filterCounts={filterCounts} filterName="source" activeFilters={activeFilters} update={update} />
                        <FilterGroup filterCounts={filterCounts} filterName="audioCodec" activeFilters={activeFilters} update={update} />
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
                            <OptionGroup filterCounts={filterCounts} filterName="subs" />
                        </select>
                    </div>
                }
                <div className="col-5 mt-3 d-flex align-items-center justify-content-center">
                    <span>
                        <Summary anime={anime} isDetailView={isDetailView} />
                    </span>
                </div>
                <div className="col-1 mt-3 d-flex">
                    <button className="btn btn-dark flex-grow-1" onClick={reset}>Reset</button>
                </div>
            </div>
        )
    }
}

// A group of buttons for a single filter
class FilterGroup extends Component {
    render() {
        const { filterCounts, filterName, activeFilters, update, fullWidth } = this.props

        return (
            <div className={fullWidth ? 'col-12 mt-3' : 'col-6 mt-3'}>
                <div className="btn-group d-flex">
                    {Data.filters[filterName].values.map(filterValue =>
                        <FilterButton
                            filterName={filterName}
                            filterValue={filterValue}
                            count={filterCounts[filterName][filterValue]}
                            currentlySelected={activeFilters[filterName] === filterValue}
                            update={update}
                            key={filterValue}
                        />
                    )}
                </div>
            </div>
        )
    }
}

// A single filter button
class FilterButton extends PureComponent {
    render() {
        const { filterName, filterValue, count, currentlySelected, update } = this.props

        return (
            <button
                className={`btn ${currentlySelected ? 'btn-dark' : 'btn-outline-dark'}`}
                onClick={!currentlySelected ? () => update('activeFilters', filterName, filterValue) : undefined}
                key={filterValue}
            >
                {Data.filters[filterName].descriptions[filterValue]}{!!count && <span> ({count})</span>}
            </button>
        )
    }
}

// A list of <option>s for use in <select>
class OptionGroup extends PureComponent {
    render() {
        const { filterCounts, filterName } = this.props

        return Data.filters[filterName].values.map(filterValue => {
            // Count how many of currently shown anime match this filter
            const count = filterCounts[filterName][filterValue]

            return !!count && <Option filterName={filterName} filterValue={filterValue} count={count} key={filterValue} />
        })
    }
}

// A single <option>
class Option extends PureComponent {
    render() {
        const { filterName, filterValue, count } = this.props

        return (
            <option value={filterValue}>
                {filterValue ? `${filterValue} (${count})` : Data.filters[filterName].descriptions[filterValue]}
            </option>
        )
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
