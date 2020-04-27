import React from 'react'
import PropTypes from 'prop-types'

import { FILTERS } from 'src/helpers/filters'

import FilterButton from 'src/components/filters/FilterButton'

import 'src/styles/Filters.scss'

/**
 * Group of buttons for a filter.
 */
export default function FilterButtonGroup({ filterName, isFullWidth = false }) {
    // The button group is either half wide or takes up the whole row
    const classes = `column buttons has-addons is-flex is-12-mobile ${isFullWidth ? 'is-12-tablet' : 'is-6-tablet'}`

    return (
        <div className={classes}>
            {FILTERS[filterName].values.map((filterValue) => (
                <FilterButton filterName={filterName} key={filterValue}>
                    {filterValue}
                </FilterButton>
            ))}
        </div>
    )
}

FilterButtonGroup.propTypes = {
    filterName: PropTypes.string.isRequired,
    isFullWidth: PropTypes.bool,
}
