import { StrictMode } from 'react'
import ReactDOM from 'react-dom'

import { QueryClient, QueryClientProvider } from 'react-query'
import { createGlobalStyle } from 'styled-components'

import './styles.css'

import App from './App'

const queryClient = new QueryClient()

const fonts = [
    '"Open Sans"',
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    '"Noto Sans"',
    'sans-serif',
    '"Apple Color Emoji"',
    '"Segoe UI Emoji"',
    '"Segoe UI Symbol"',
    '"Noto Color Emoji"',
].join(',')

const GlobalStyle = createGlobalStyle`
    body {
        font-family: ${fonts};
    }
`

ReactDOM.render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <GlobalStyle />
            <App />
        </QueryClientProvider>
    </StrictMode>,
    document.getElementById('root')
)
