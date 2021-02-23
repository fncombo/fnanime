import { FunctionComponent, ReactNode } from 'react'

import { Tag } from 'antd'
import styled from 'styled-components'

import { FilterName, filtersDictionary, FilterValue } from './filters'

const TightTag = styled(Tag)`
    margin: 0;
`

/**
 * Given a filter name and value, displays its label as a tag. If the filter value has a color, it will be used
 * for the tag. Can specify children as a render function for the label value.
 */
const FilterTag: FunctionComponent<{
    name: FilterName
    value: FilterValue
    children?: (label: ReactNode) => ReactNode
}> = ({ name, value, children }) => {
    const { color, label } = filtersDictionary[name][value]

    return <TightTag color={color}>{children ? children(label) : label}</TightTag>
}

export default FilterTag
