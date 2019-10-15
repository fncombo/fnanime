// React
import React, { useContext } from 'react'

// Data
import { FiltersState } from 'js/data/GlobalState'
import { FILTERS } from 'js/data/Filters'

/**
 * Single filter option in a select list for a value of a filter with a count of how many anime currently match it.
 */
function SelectOption({ filterName, children: filterValue }) {
    const { filterCounts } = useContext(FiltersState)

    // Use the filter value if it's a string, otherwise look up the definition if it's anything else
    const value = typeof filterValue === 'string'
        ? filterValue
        : FILTERS[filterName].descriptions[filterValue]

    // How many anime match this filter
    const count = filterCounts[filterName][filterValue]

    // Do not show count on the "all" selection
    return (
        <option value={filterValue}>
            {value}
            {!!filterValue && !!count && ` (${count})`}
        </option>
    )
}

export default SelectOption
