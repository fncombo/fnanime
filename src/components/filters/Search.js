import React, { useCallback, useContext } from 'react'

import { ACTIONS, GlobalState } from 'src/helpers/global-state'

/**
 * Search input to filter anime by a query string.
 */
export default function Search() {
    const {
        state: { searchQuery },
        dispatch,
    } = useContext(GlobalState)

    // Callback for the search input change
    const search = useCallback(
        ({ target: { value } }) => {
            dispatch({
                type: ACTIONS.SEARCH,
                searchQuery: value,
            })
        },
        [dispatch]
    )

    return <input type="text" className="input" placeholder="Search" value={searchQuery} onChange={search} />
}
