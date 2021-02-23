import { FunctionComponent } from 'react'

import FilterTag from '../filters/FilterTag'
import { Anime } from '../types'

/**
 * TODO: ...
 */
const TableCell: FunctionComponent<{
    filter?: keyof Anime
    children: JSX.Element
}> = ({ filter, children }) => {
    if (!children) {
        return <>&ndash;</>
    }

    if (filter) {
        return <FilterTag name={filter} value={children as string | number} />
    }

    return children
}

export default TableCell
