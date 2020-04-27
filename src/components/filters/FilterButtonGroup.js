import React from 'react'
import PropTypes from 'prop-types'

import { FILTERS } from 'src/helpers/filters'

import FilterButton from 'src/components/filters/FilterButton'

import 'src/styles/Filters.scss'

/**
 * Group of buttons for a filter.
 */
export default function FilterButtonGroup({ filterName, size = 6 }) {
    return (
        <div className={`column buttons has-addons is-flex is-12-mobile is-${size}-tablet`}>
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
    size: PropTypes.number,
}
