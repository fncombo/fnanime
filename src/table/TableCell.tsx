import { FunctionComponent } from 'react'

import { FilterName, FilterValue } from '../filters/config'
import FilterTag from '../filters/FilterTag'

/**
 * Displays data for a table cell. If the cell is empty, a dash is shown. If a filter name is given, the value will
 * be rendered as a filter tag.
 */
const TableCell: FunctionComponent<{
    filter?: FilterName
    children: JSX.Element
}> = ({ filter, children }) => {
    if (!children) {
        return <>&ndash;</>
    }

    if (filter) {
        return <FilterTag name={filter} value={children as FilterValue} />
    }

    return children
}

export default TableCell
