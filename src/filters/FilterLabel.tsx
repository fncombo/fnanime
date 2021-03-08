import { FunctionComponent, ReactNode } from 'react'

import styled from 'styled-components'

const AnimeCount = styled.span`
    opacity: 0.5;
`

/**
 * Displays the content for a filter button or select option. When the filter has anime matching it, the anime count
 * is displayed in brackets next to the value.
 */
const FilterLabel: FunctionComponent<{
    animeCount: number
    children: ReactNode
}> = ({ animeCount, children }) => (
    <>
        {children}
        {!!animeCount && <AnimeCount> ({animeCount})</AnimeCount>}
    </>
)

export default FilterLabel
