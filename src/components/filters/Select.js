import React, { useCallback, useContext } from 'react'
import PropTypes from 'prop-types'

import { isString } from 'is-what'

import { FILTERS } from 'src/helpers/filters'
import { ACTIONS, FiltersState, GlobalState } from 'src/helpers/global-state'

import SelectOption from 'src/components/filters/SelectOption'
import SelectOptionGroup from 'src/components/filters/SelectOptionGroup'

/**
 * Select input for a filter. Options are divided by whether they currently have anime matching anime to them or not.
 */
export default function Select({ filterName }) {
    const {
        state: { activeFilters },
        dispatch,
    } = useContext(GlobalState)
    const { filterCounts } = useContext(FiltersState)

    // Callback to update the anime list when selecting this filter
    const selectFilter = useCallback(
        ({ target: { value: filterValue } }) => {
            let actualFilterValue = filterValue

            if (filterValue === 'false') {
                // Check if the filter value is the string "false" and convert it to a proper boolean if it is
                actualFilterValue = false
            } else if (/^\d+$/.test(filterValue)) {
                // Check if the option value is fully a number, and convert it to the correct type if it is
                actualFilterValue = parseInt(filterValue, 10)
            }

            dispatch({
                type: ACTIONS.SELECT_FILTER,
                filterName,
                filterValue: actualFilterValue,
            })
        },
        [dispatch, filterName]
    )

    // Get all the filter values which currently have matching anime to them
    const withCount = FILTERS[filterName].values
        .filter((filterValue) => filterValue && filterCounts[filterName][filterValue])
        .sort(
            (filterValueA, filterValueB) =>
                // Sort options by how many matches they have to them
                filterCounts[filterName][filterValueB] - filterCounts[filterName][filterValueA] ||
                // If the same number of matches, sort alphabetically
                (isString(filterValueA) && filterValueA.localeCompare(filterValueB))
        )

    // Get all the filter values which don't currently have matching anime to them, sorted alphabetically by default
    const withoutCount = FILTERS[filterName].values.filter(
        (filterValue) => filterValue && !filterCounts[filterName][filterValue]
    )

    return (
        <div className="select is-fullwidth">
            <select value={activeFilters[filterName]} onChange={selectFilter}>
                <SelectOption filterName={filterName} filterValue={false} />
                <SelectOptionGroup filterName={filterName} options={withCount} label="Have matching anime" />
                <SelectOptionGroup filterName={filterName} options={withoutCount} label="No matching anime" />
            </select>
        </div>
    )
}

Select.propTypes = {
    filterName: PropTypes.string.isRequired,
}
