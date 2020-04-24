import React, { useContext } from 'react'
import PropTypes from 'prop-types'

import classNames from 'classnames'

import { FILTERS } from 'src/data/filters'
import { ACTIONS, FiltersState, GlobalState } from 'src/data/global-state'

import 'src/styles/Filters.scss'

/**
 * Single filter button for a value of a filter with a count of how many anime currently match it.
 */
export default function FilterButton({ filterName, children: filterValue }) {
    const {
        state: { activeFilters },
        dispatch,
    } = useContext(GlobalState)
    const { filterCounts } = useContext(FiltersState)

    /**
     * Callback to update the anime list when selecting this filter.
     */
    function selectFilterCallback() {
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

    // Styling based on whether this filter is "all", whether it's selected, and whether it has any matching anime
    const classes = classNames('button', {
        'is-outlined': !isSelected,
        'is-faded': notAllFilterValue && !count,
        'is-dark': !(notAllFilterValue && !count),
    })

    return (
        <button type="button" className={classes} onClick={selectFilterCallback}>
            {FILTERS[filterName].descriptions[filterValue]}
            {!!count && notAllFilterValue && <span className="count">{count}</span>}
        </button>
    )
}

FilterButton.propTypes = {
    filterName: PropTypes.string.isRequired,
    children: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.bool]),
}
