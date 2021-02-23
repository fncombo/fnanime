import { FunctionComponent } from 'react'

import { Alert, Button, Spin } from 'antd'
import { useQuery } from 'react-query'
import styled from 'styled-components'

import App from './App'
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

/**
 * Loads the anime list data from the API. Shows a pretty spinner while loading, an error message with a button to
 * retry if there's an error, or the loaded anime list.
 */
const LoadAnime: FunctionComponent = () => {
    const { data, isLoading, isError, refetch } = useQuery<{
        anime: Anime[]
        updatedAt: number
    }>('data', () => fetch(process.env.REACT_APP_API as string).then((res) => res.json()), queryOptions)

    if (isLoading) {
        return (
            <Centered>
                <Spin size="large" />
            </Centered>
        )
    }

    if (isError) {
        const action = (
            <Button onClick={() => refetch()} danger>
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

    return <App anime={data?.anime} dbUpdatedAt={data?.updatedAt} />
}

export default LoadAnime
