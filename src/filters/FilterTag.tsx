import { FunctionComponent, ReactNode } from 'react'

import { Tag } from 'antd'
import styled from 'styled-components'

import { Anime } from '../types'

import { filtersDictionary } from './config'

const TightTag = styled(Tag)`
    margin: 0;
`

/**
 * Displays a filter's label as a tag in the correct colour.
 */
const FilterTag: FunctionComponent<{
    name: keyof Anime
    value: string | number
    children?: (label: ReactNode) => ReactNode
}> = ({ name, value, children }) => {
    const { color, label } = filtersDictionary[name][value]

    return <TightTag color={color}>{children ? children(label) : label}</TightTag>
}

export default FilterTag
