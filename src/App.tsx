import { FunctionComponent, useState } from 'react'

import { Alert, Button, Divider, Spin, Typography } from 'antd'
import { format, fromUnixTime } from 'date-fns'
import { useQuery } from 'react-query'
import styled from 'styled-components'

import FilterControls from './filters/FilterControls'
import { FiltersProvider } from './filters/Filters'
import Gallery from './gallery/Gallery'
import { ModalProvider } from './modal/Modal'
import Statistics from './statistics/Statistics'
import AnimeTable from './table/AnimeTable'
import { Anime } from './types'

const queryOptions = {
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
}

const Centered = styled.div`
    display: flex;
    width: 100vw;
    height: 100vh;
    align-items: center;
    justify-content: center;
`

const WideAlert = styled(Alert)`
    width: 500px;
    align-items: center;
`

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
 * Loads the anime list data from the API. Shows a pretty spinner while loading, an error message with a button to
 * retry if there's an error, or the loaded anime list.
 */
const LoadAnime: FunctionComponent = () => {
    const { data, isLoading, isError, refetch } = useQuery<{
        anime: Anime[]
        updatedAt: number
    }>('data', () => fetch(`${process.env.REACT_APP_DATABASE_URL}/data.json`).then((res) => res.json()), queryOptions)

    const [hasTable, setHasTable] = useState(false)
    const [hasStatistics, setHasStatistics] = useState(false)

    if (isLoading) {
        return (
            <Centered>
                <Spin size="large" />
            </Centered>
        )
    }

    if (isError || !data) {
        const action = (
            <Button
                onClick={(): void => {
                    refetch()
                }}
                danger
            >
                Retry
            </Button>
        )

        return (
            <Centered>
                <WideAlert
                    message="Error"
                    description="Couldn't load the anime list."
                    type="error"
                    showIcon
                    action={action}
                />
            </Centered>
        )
    }

    const { anime, updatedAt } = data

    const toggleTable = (): void => setHasTable(!hasTable)
    const toggleStatistics = (): void => setHasStatistics(!hasStatistics)

    return (
        <FiltersProvider anime={anime}>
            <ModalProvider anime={anime}>
                <Container>
                    <FilterControls
                        hasTable={hasTable}
                        toggleTable={toggleTable}
                        hasStatistics={hasStatistics}
                        toggleStatistics={toggleStatistics}
                    />
                    {hasTable && <AnimeTable />}
                </Container>
                {hasStatistics && (
                    <>
                        <Divider />
                        <Container>
                            <Statistics />
                        </Container>
                    </>
                )}
                <Divider />
                <Gallery />
                <Divider />
                <Footer>
                    <Typography.Paragraph>
                        Offline data last updated on {format(fromUnixTime(updatedAt), 'do LLLL yyy')}
                    </Typography.Paragraph>
                    <Typography.Text>
                        Anime list data last updated on {format(fromUnixTime(updatedAt), 'do LLLL yyy')}
                    </Typography.Text>
                </Footer>
            </ModalProvider>
        </FiltersProvider>
    )
}

export default LoadAnime
