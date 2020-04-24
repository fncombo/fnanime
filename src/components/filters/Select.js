import React, { useContext } from 'react'

import { GlobalState, FiltersState, ACTIONS } from 'src/data/GlobalState'
import { FILTERS } from 'src/data/Filters'

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
    function selectFilterCallback({ target: { value: filterValue } }) {
        let actualFilterValue = filterValue

        // Check if the filter value is the string "false" and convert it to a proper boolean if it is
        if (filterValue === 'false') {
            actualFilterValue = false

            // Check if the option value is fully a number, and convert it to the correct type if it is
        } else if (/^\d+$/.test(filterValue)) {
            actualFilterValue = parseInt(filterValue, 10)
        }

        dispatch({
            type: ACTIONS.SELECT_FILTER,
            filterName,
            filterValue: actualFilterValue,
        })
    }

    // Currently active value for this filter
    const activeFilterValue = activeFilters[filterName]

    // Get all the filter values which currently have matching anime to them
    const withCount = FILTERS[filterName].values
        .filter((filterValue) => filterValue && filterCounts[filterName][filterValue])
        .sort(
            (filterValueA, filterValueB) =>
                // Sort options by how many matches they have to them
                filterCounts[filterName][filterValueB] - filterCounts[filterName][filterValueA] ||
                // If the same number of matches, sort alphabetically
                (typeof filterValueA === 'string' && filterValueA.localeCompare(filterValueB))
        )

    // Get all the filter values which don't currently have matching anime to them, sorted alphabetically by default
    const withoutCount = FILTERS[filterName].values.filter(
        (filterValue) => filterValue && !filterCounts[filterName][filterValue]
    )

    return (
        <div className="select is-fullwidth">
            <select value={activeFilterValue} onChange={selectFilterCallback}>
                <SelectOption filterName={filterName}>{false}</SelectOption>
                <SelectOptionGroup filterName={filterName} options={withCount}>
                    Have matching anime
                </SelectOptionGroup>
                <SelectOptionGroup filterName={filterName} options={withoutCount}>
                    No matching anime
                </SelectOptionGroup>
            </select>
        </div>
    )
}
