// React
import React from 'react'

// Components
import SelectOption from 'js/components/filters/SelectOption'

/**
 * A group of filter options in a select list with a label.
 */
function SelectOptionGroup({ filterName, options, children: label }) {
    // Skip option group if there are no options
    if (!options.length) {
        return null
    }

    return (
        <optgroup label={label}>
            {options.map(filterValue =>
                <SelectOption filterName={filterName} key={filterValue}>
                    {filterValue}
                </SelectOption>
            )}
        </optgroup>
    )
}

export default SelectOptionGroup
