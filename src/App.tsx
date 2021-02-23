import { FunctionComponent, useState } from 'react'

import { Divider, Typography } from 'antd'
import { format, fromUnixTime } from 'date-fns'
import styled from 'styled-components'

import Filters from './filters/Filters'
import useFilters from './filters/useFilters'
import Gallery from './gallery/Gallery'
import Statistics from './statistics/Statistics'
import AnimeTable from './table/AnimeTable'
import { Anime } from './types'

const Container = styled.div`
    width: 1300px;
    margin: 0 auto;
`

const Footer = styled.div`
    padding-bottom: 24px;
    margin-top: 24px;
    text-align: center;
`

/**
 * After the anime has been loaded, displays the filters, table, statistics, and gallery.
 */
const App: FunctionComponent<{
    anime?: Anime[]
    dbUpdatedAt?: number
}> = ({ anime = [], dbUpdatedAt }) => {
    const {
        filters,
        selectFilters,
        setFilter,
        resetFilters,
        searchValue,
        setSearchValue,
        hasAdvancedFilters,
        toggleAdvancedFilters,
        filteredAnime,
    } = useFilters(anime)
    const [hasTable, setHasTable] = useState(false)

    return (
        <>
            <Container>
                <Filters
                    filters={filters}
                    selectFilters={selectFilters}
                    setFilter={setFilter}
                    resetFilters={resetFilters}
                    searchValue={searchValue}
                    setSearchValue={setSearchValue}
                    hasAdvancedFilters={hasAdvancedFilters}
                    toggleAdvancedFilters={toggleAdvancedFilters}
                    filteredAnime={filteredAnime}
                    hasTable={hasTable}
                    setHasTable={setHasTable}
                />
                {hasTable && <AnimeTable anime={filteredAnime} hasAdvancedFilters={hasAdvancedFilters} />}
            </Container>
            <Divider />
            <Container>
                <Statistics anime={filteredAnime} hasAdvancedFilters={hasAdvancedFilters} />
            </Container>
            <Divider />
            <Gallery anime={filteredAnime} />
            {typeof dbUpdatedAt === 'number' && (
                <>
                    <Divider />
                    <Footer>
                        <Typography.Paragraph>
                            Offline data last updated on {format(fromUnixTime(dbUpdatedAt), 'do LLLL yyy')}
                        </Typography.Paragraph>
                        <Typography.Text>
                            Anime list data last updated on {format(fromUnixTime(dbUpdatedAt), 'do LLLL yyy')}
                        </Typography.Text>
                    </Footer>
                </>
            )}
        </>
    )
}

export default App
