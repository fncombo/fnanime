import React, { useContext } from 'react'

import { ACTIONS, GlobalState } from 'src/data/global-state'

import 'src/styles/Filters.scss'

/**
 * Search input to filter anime by a query string.
 */
export default function Search() {
    const {
        state: { searchQuery },
        dispatch,
    } = useContext(GlobalState)

    /**
     * Callback for the search input change.
     */
    function searchCallback({ target: { value } }) {
        dispatch({
            type: ACTIONS.SEARCH,
            searchQuery: value,
        })
    }

    return <input type="text" className="input" placeholder="Search" value={searchQuery} onChange={searchCallback} />
}
