// React
import React, { useContext } from 'react'

// Data
import { GlobalState, FiltersState, ACTIONS } from 'js/data/GlobalState'
import { FILTERS } from 'js/data/Filters'

// Components
import SelectOption from 'js/components/filters/SelectOption'
import SelectOptionGroup from 'js/components/filters/SelectOptionGroup'

/**
 * Select input for a filter. Updates global filtering. Options are divided by whether
 * they currently have anime matching anime to them or not.
 */
function Select({ filterName }) {
    // Get the active filter setting for the filter name of this select
    const { state: { activeFilters: { [filterName]: value } }, dispatch } = useContext(GlobalState)
    const { filterCounts } = useContext(FiltersState)

    // Callback to update the anime list when selecting this filter
    const selectFilter = ({ target: { value: filterValue } }) => {
        let actualFilterValue = filterValue

        // Check if the filter value is the string "false" and convert it to a proper boolean if it is
        if (filterValue === 'false') {
            actualFilterValue = false
        }

        // Check if the option value is fully a number, and convert it to the correct type if it is
        if (/^\d+$/.test(filterValue)) {
            actualFilterValue = parseInt(filterValue, 10)
        }

        dispatch({
            type: ACTIONS.SELECT_FILTER,
            filterName,
            filterValue: actualFilterValue,
        })
    }

    // Get all the filter values which currently have matching anime to them
    const withCount = FILTERS[filterName].values.filter(filterValue =>
        filterValue && filterCounts[filterName][filterValue]
    ).sort((filterValueA, filterValueB) =>
        // Sort options by how many matches they have to them
        filterCounts[filterName][filterValueB] - filterCounts[filterName][filterValueA]
        // If the same number of matches, sort alphabetically
        || (typeof filterValueA === 'string' && filterValueA.localeCompare(filterValueB))
    )

    // Get all the filter values which don't currently have matching anime to them,
    // sorted alphabetically by default
    const withoutCount = FILTERS[filterName].values.filter(filterValue =>
        filterValue && !filterCounts[filterName][filterValue]
    )

    return (
        <div className="select is-fullwidth">
            <select value={value} onChange={selectFilter}>
                <SelectOption filterName={filterName} filterValue={false} />
                <SelectOptionGroup filterName={filterName} label="Have matching anime" options={withCount} />
                <SelectOptionGroup filterName={filterName} label="No matching anime" options={withoutCount} />
            </select>
        </div>
    )
}

export default Select
