// React
import React, { useContext, useState } from 'react'

// Style
import '../../css/Filters.css'

// Data
import { GlobalState, FiltersState, ACTIONS } from '../data/GlobalState'
import { Filters, FilterNames } from '../data/Filters'

// Helpers
import { makeFilterCounts } from '../helpers/Filters'

/**
 * Groups of filters, search input, summary, and reset button.
 */
function FilterButtons() {
    const { state: { anime }, dispatch } = useContext(GlobalState)
    const [ searchValue, setSearchValue ] = useState('')

    // Callback for the search input change
    const search = ({ target: { value: searchQuery } }) => {
        // Update the input value
        setSearchValue(searchQuery)

        // Search the anime list
        dispatch({
            type: ACTIONS.SEARCH,
            searchQuery,
        })
    }

    // Reset filters, sorting, and search
    const reset = () => {
        setSearchValue('')

        dispatch({ type: ACTIONS.RESET })
    }

    // Count how many anime match each filter
    const filterCounts = makeFilterCounts()

    anime.forEach(cartoon => {
        FilterNames.forEach(filterName => {
            filterCounts[filterName][cartoon[filterName]] += 1
        })
    })

    return (
        <div className="row">
            <FiltersState.Provider value={{ filterCounts }}>
                <FilterGroup filterName="rating" fullWidth />
                <FilterGroup filterName="type" />
                <FilterGroup filterName="resolution" />
                <FilterGroup filterName="status" />
                <FilterGroup filterName="videoCodec" />
                <FilterGroup filterName="source" />
                <FilterGroup filterName="audioCodec" />
                <div className="col-3 mt-3">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search by anime title&hellip;"
                        value={searchValue}
                        onChange={search}
                        autoFocus
                    />
                </div>
                <OptionGroup filterName="subs" />
                <div className="col-5 mt-3 d-flex align-items-center justify-content-center">
                    <Summary />
                </div>
                <div className="col-1 mt-3 d-flex">
                    <button className="btn btn-dark flex-grow-1" onClick={reset}>
                        Reset
                    </button>
                </div>
            </FiltersState.Provider>
        </div>
    )
}

/**
 * Group of buttons for a filter. Can span full width of the container. Updates global filtering.
 */
function FilterGroup({ filterName, fullWidth }) {
    return (
        <div className={`col-${fullWidth ? '12' : '6'} mt-3 btn-group`}>
            {Filters[filterName].values.map(filterValue =>
                <FilterButton filterName={filterName} filterValue={filterValue} key={filterValue} />
            )}
        </div>
    )
}

/**
 * Single filter button for a value of a filter with a count of how many anime currently match it.
 */
function FilterButton({ filterName, filterValue }) {
    const { state: { activeFilters }, dispatch } = useContext(GlobalState)
    const { filterCounts } = useContext(FiltersState)

    // Callback to update the anime list when selecting this filter
    const selectFilter = () => {
        dispatch({
            type: ACTIONS.SELECT_FILTER,
            filterName,
            filterValue,
        })
    }

    // Whether this filter is currently selected and a count of how many anime match it
    const isSelected = activeFilters[filterName] === filterValue
    const count = filterCounts[filterName][filterValue]

    return (
        <button
            className={`btn ${isSelected ? 'btn-dark' : 'btn-outline-dark'} ${filterValue && !count ? 'btn-fade' : ''}`}
            onClick={selectFilter}
        >
            {Filters[filterName].descriptions[filterValue]}
            {!!count && <span>{count}</span>}
        </button>
    )
}

/**
 * Select input for a filter. Updates global filtering.
 */
function OptionGroup({ filterName }) {
    const { state: { activeFilters: { [filterName]: activeFilterValues } }, dispatch } = useContext(GlobalState)
    const { value } = useState(activeFilterValues)

    // Callback to update the anime list when selecting this filter
    const selectFilter = ({ target: { value: filterValue } }) => {
        dispatch({
            type: ACTIONS.SELECT_FILTER,
            filterName,
            filterValue,
        })
    }

    return (
        <div className="col-3 mt-3">
            <select className="form-control custom-select" value={value} onChange={selectFilter}>
                {Filters[filterName].values.map(filterValue =>
                    <Option filterName={filterName} filterValue={filterValue} key={filterValue} />
                )}
            </select>
        </div>
    )
}

/**
 * Single filter option  for a value of a filter with a count of how many anime currently match it.
 */
function Option({ filterName, filterValue }) {
    const { filterCounts } = useContext(FiltersState)

    // Use the filter value, otherwise look up the definition
    const value = filterValue || Filters[filterName].descriptions[filterValue]

    // How many anime match this filter
    const count = filterCounts[filterName][filterValue]

    // Do not show count on "all" selection
    return (
        <option value={filterValue}>
            {value}
            {filterValue && !!count && ` (${count})`}
        </option>
    )
}

/**
 * Displays how many downloaded and not downloaded anime there are.
 */
function Summary() {
    const { state: { anime } } = useContext(GlobalState)

    // Why is the anime gone!
    if (!anime.length) {
        return <span>Found no anime</span>
    }

    const downloadedCount = anime.filter(({ size }) => !!size).length
    const notDownloadedCount = anime.length - downloadedCount

    if (downloadedCount && notDownloadedCount) {
        return <span>Found <strong>{downloadedCount}</strong> +{notDownloadedCount} anime</span>
    } else if (downloadedCount && !notDownloadedCount) {
        return <span>Found <strong>{downloadedCount}</strong> anime</span>
    } else if (!downloadedCount && notDownloadedCount) {
        return <span>Found {notDownloadedCount} anime</span>
    }
}

// Exports
export default FilterButtons
