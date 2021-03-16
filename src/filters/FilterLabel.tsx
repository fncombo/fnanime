import { FunctionComponent, ReactNode } from 'react'

import { FilterName, filtersDictionary, FilterValue } from './config'

/**
 * Given a filter name and value, displays its label. Can specify children as a render function for the label value.
 */
const FilterLabel: FunctionComponent<{
    name: FilterName
    value: FilterValue
    children?: (label: ReactNode) => ReactNode
}> = ({ name, value, children }) => {
    const { label } = filtersDictionary[name][value]

    return (children ? children(label) : label) as JSX.Element
}

export default FilterLabel
