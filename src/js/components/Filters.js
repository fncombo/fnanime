// React
import React, { useContext, useState } from 'react'

// Libraries
import classNames from 'classnames'

// Style
import 'scss/Filters.scss'

// Data
import { GlobalState, FiltersState, ACTIONS } from 'js/data/GlobalState'
import { FILTERS } from 'js/data/Filters'

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
    const filterCounts = FILTERS.makeCounts(anime)

    return (
        <div className="columns is-mobile is-multiline filters">
            <FiltersState.Provider value={{ filterCounts }}>
                <FilterGroup filterName="rating" fullWidth />
                <FilterGroup filterName="type" />
                <FilterGroup filterName="resolution" />
                <FilterGroup filterName="status" />
                <FilterGroup filterName="videoCodec" />
                <FilterGroup filterName="source" />
                <FilterGroup filterName="audioCodec" />
                <div className="column is-12-mobile is-3-tablet">
                    <input
                        type="text"
                        className="input"
                        placeholder="Search"
                        value={searchValue}
                        onChange={search}
                    />
                </div>
                <div className="column is-6-mobile is-2-tablet">
                    <OptionGroup filterName="subs" />
                </div>
                <div className="column is-6-mobile is-2-tablet">
                    <OptionGroup filterName="genres" />
                </div>
                <div className="column is-6-mobile is-2-tablet">
                    <OptionGroup filterName="studios" />
                </div>
                <div className="column is-8-mobile is-2-tablet summary">
                    <Summary />
                </div>
                <div className="column is-4-mobile is-1-tablet">
                    <button className="button is-fullwidth" onClick={reset}>
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
    const classes = classNames('column is-flex buttons has-addons is-12-mobile ', {
        'is-12-tablet': fullWidth,
        'is-6-tablet': !fullWidth,
    })

    return (
        <div className={classes}>
            {FILTERS[filterName].values.map(filterValue =>
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
    const classes = classNames('button', {
        'is-outlined': !isSelected,
        'is-faded': filterValue && !count,
        'is-dark': !(filterValue && !count),
    })

    return (
        <button className={classes} onClick={selectFilter}>
            {FILTERS[filterName].descriptions[filterValue]}
            {!!count && filterValue !== false && <span className="count">{count}</span>}
        </button>
    )
}

/**
 * Select input for a filter. Updates global filtering.
 */
function OptionGroup({ filterName }) {
    const { state: { activeFilters: { [filterName]: value } }, dispatch } = useContext(GlobalState)
    const { filterCounts } = useContext(FiltersState)

    // Callback to update the anime list when selecting this filter
    const selectFilter = ({ target: { value: filterValue } }) => {
        // Check if the option value is potentially a valid number, and it if it is
        const actualFilterValue = /^\d+$/.test(filterValue) ? parseInt(filterValue, 10) : filterValue

        dispatch({
            type: ACTIONS.SELECT_FILTER,
            filterName,
            filterValue: actualFilterValue,
        })
    }

    const withCount = FILTERS[filterName].values.filter(filterValue =>
        filterValue && filterCounts[filterName][filterValue]
    ).sort((filterValueA, filterValueB) =>
        // Sort options by how many matches they have to them
        filterCounts[filterName][filterValueB] - filterCounts[filterName][filterValueA]
        // If the same number of matches, sort alphabetically
        || (typeof filterValueA === 'string' && filterValueA.localeCompare(filterValueB))
    )

    const withoutCount = FILTERS[filterName].values.filter(filterValue =>
        filterValue && !filterCounts[filterName][filterValue]
    )

    return (
        <div className="select is-fullwidth">
            <select value={value} onChange={selectFilter}>
                <Option filterName={filterName} filterValue={false} />
                {!!withCount.length &&
                    <optgroup label="Have matching anime">
                        {withCount.map(filterValue =>
                            <Option filterName={filterName} filterValue={filterValue} key={filterValue} />
                        )}
                    </optgroup>
                }
                {!!withoutCount.length &&
                    <optgroup label="No matching anime">
                        {withoutCount.map(filterValue =>
                            <Option filterName={filterName} filterValue={filterValue} key={filterValue} />
                        )}
                    </optgroup>
                }
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
    const value = typeof filterValue === 'string' ? filterValue : FILTERS[filterName].descriptions[filterValue]

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
        return null
    }

    const downloadedCount = anime.filter(({ size }) => !!size).length
    const notDownloadedCount = anime.length - downloadedCount

    if (downloadedCount && notDownloadedCount) {
        return <span>Found <strong>{downloadedCount}</strong> + {notDownloadedCount} anime</span>
    } else if (downloadedCount && !notDownloadedCount) {
        return <span>Found <strong>{downloadedCount}</strong> anime</span>
    } else if (!downloadedCount && notDownloadedCount) {
        return <span>Found {notDownloadedCount} anime</span>
    }
}

// Exports
export default FilterButtons
