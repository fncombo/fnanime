import React, { useContext } from 'react'
import PropTypes from 'prop-types'

import { isString } from 'is-what'

import { FILTERS } from 'src/helpers/filters'
import { FiltersState } from 'src/helpers/global-state'

/**
 * Single filter option in a select list for a value of a filter with a count of how many anime currently match it.
 */
export default function SelectOption({ filterName, filterValue }) {
    const { filterCounts } = useContext(FiltersState)

    // Use the filter value if it's a string, otherwise look up the definition if it's anything else
    const value = isString(filterValue) ? filterValue : FILTERS[filterName].descriptions[filterValue]

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

SelectOption.propTypes = {
    filterName: PropTypes.string.isRequired,
    filterValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.bool]).isRequired,
}
