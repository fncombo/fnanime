// React
import React, { useContext } from 'react'

// Libraries
import classNames from 'classnames'

// Style
import 'scss/Filters.scss'

// Data
import { GlobalState, FiltersState, ACTIONS } from 'js/data/GlobalState'
import { FILTERS } from 'js/data/Filters'

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

    // Whether this filter is currently selected (being filtered by)
    const isSelected = activeFilters[filterName] === filterValue

    // Whether or not this is the "all" option
    const notAllFilterValue = filterValue !== false

    // Count of how many anime match it
    const count = filterCounts[filterName][filterValue]

    // Styling based on whether this filter is "all", whether or not it's selected,
    // and whether it has any matching anime
    const classes = classNames('button', {
        'is-outlined': !isSelected,
        'is-faded': notAllFilterValue && !count,
        'is-dark': !(notAllFilterValue && !count),
    })

    return (
        <button className={classes} onClick={selectFilter}>
            {FILTERS[filterName].descriptions[filterValue]}
            {!!count && notAllFilterValue && <span className="count">{count}</span>}
        </button>
    )
}

export default FilterButton
