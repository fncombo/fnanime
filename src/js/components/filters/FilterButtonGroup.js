// React
import React from 'react'

// Libraries
import classNames from 'classnames'

// Style
import 'scss/Filters.scss'

// Data
import { FILTERS } from 'js/data/Filters'

// Components
import FilterButton from 'js/components/filters/FilterButton'

/**
 * Group of buttons for a filter.
 */
function FilterButtonGroup({ filterName, isFullWidth }) {
    // The button group is either half wide or takes up the whole row
    const classes = classNames(
        'column buttons has-addons is-flex is-12-mobile',
        isFullWidth ? 'is-12-tablet' : 'is-6-tablet'
    )

    return (
        <div className={classes}>
            {FILTERS[filterName].values.map(filterValue =>
                <FilterButton filterName={filterName} key={filterValue}>
                    {filterValue}
                </FilterButton>
            )}
        </div>
    )
}

export default FilterButtonGroup
