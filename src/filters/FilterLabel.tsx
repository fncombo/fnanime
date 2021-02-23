import { FunctionComponent, ReactNode } from 'react'

import styled from 'styled-components'

const FilterAnimeCount = styled.span`
    opacity: 0.5;
`

/**
 * Displays a label for a filter button. When the filter has anime matching it, the anime count is displayed in
 * brackets.
 */
const FilterLabel: FunctionComponent<{
    animeCount?: number
    children: ReactNode
}> = ({ animeCount, children }) => (
    <>
        {children}
        {!!animeCount && <FilterAnimeCount> ({animeCount})</FilterAnimeCount>}
    </>
)

export default FilterLabel
