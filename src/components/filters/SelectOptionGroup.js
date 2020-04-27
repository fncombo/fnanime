import React from 'react'
import PropTypes from 'prop-types'

import SelectOption from 'src/components/filters/SelectOption'

/**
 * A group of filter options in a select list with a label.
 */
export default function SelectOptionGroup({ filterName, options, label }) {
    // Skip option group if there are no options
    if (!options.length) {
        return null
    }

    return (
        <optgroup label={label}>
            {options.map((filterValue) => (
                <SelectOption filterName={filterName} filterValue={filterValue} key={filterValue} />
            ))}
        </optgroup>
    )
}

SelectOptionGroup.propTypes = {
    filterName: PropTypes.string.isRequired,
    options: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])).isRequired,
    label: PropTypes.string.isRequired,
}
