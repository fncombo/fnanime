// React
import React from 'react'
import { render, hydrate } from 'react-dom'

// Components
import App from 'js/components/App'

// Service worker
import * as serviceWorker from 'serviceWorker'

// Root element of the app
const root = document.getElementById('root')

// Hydrate server rendered HTML or render from scratch
if (root.hasChildNodes()) {
    hydrate(<App />, root)
} else {
    render(<App />, root)
}

serviceWorker.register()
