// React
import React, { useContext } from 'react'

// Style
import 'scss/Filters.scss'

// Data
import { GlobalState, ACTIONS } from 'js/data/GlobalState'

/**
 * Search input to filter anime by a query string.
 */
function Search() {
    const { state: { searchQuery }, dispatch } = useContext(GlobalState)

    // Callback for the search input change
    const searchCallback = ({ target: { value } }) => {
        dispatch({
            type: ACTIONS.SEARCH,
            searchQuery: value,
        })
    }

    return <input type="text" className="input" placeholder="Search" value={searchQuery} onChange={searchCallback} />
}

// Exports
export default Search
