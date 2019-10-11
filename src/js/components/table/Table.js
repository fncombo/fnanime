// React
import React, { useContext, useReducer } from 'react'

// Style
import 'scss/Table.scss'

// Data
import { GlobalState, TableState, ACTIONS } from 'js/data/GlobalState'
import { DEFAULTS } from 'js/data/Data'

// Components
import Icon from 'js/components/Icon'
import Header from 'js/components/table/Header'
import Row from 'js/components/table/Row'
import Pagination from 'js/components/Pagination'

// Default table state
const INITIAL_TABLE_STATE = {
    page: 1,
}

/**
 * Table state reducer.
 */
function tableStateReducer(state, action) {
    switch (action.type) {
    case ACTIONS.NEXT_PAGE:
        return { page: state.page + 1 }

    case ACTIONS.PREV_PAGE:
        return { page: state.page - 1 }

    case ACTIONS.SET_PAGE:
        return { page: action.page }

    default:
        return state
    }
}

/**
 * Table showing all the currently filtered and searched anime with pagination.
 */
function Table() {
    const { state: { anime: allAnime } } = useContext(GlobalState)
    const [ state, dispatch ] = useReducer(tableStateReducer, INITIAL_TABLE_STATE)

    // If there are no anime to display, show an error message
    if (!allAnime.length) {
        return (
            <div className="container">
                <p className="table-empty">
                    <Icon icon="exclamation-circle" /> No matching anime found
                </p>
            </div>
        )
    }

    // Calculate the last possible page number based on the total number of anime and
    // how many anime are displayed per page
    const lastPage = Math.ceil(allAnime.length / DEFAULTS.perPage)

    return (
        <TableState.Provider value={{ state, dispatch, lastPage }}>
            <div className="container">
                <div className="table">
                    <Header />
                    {allAnime.slice((state.page - 1) * DEFAULTS.perPage, state.page * DEFAULTS.perPage).map(anime =>
                        <Row key={anime.id} {...anime} />
                    )}
                    <Pagination />
                </div>
            </div>
        </TableState.Provider>
    )
}

// Exports
export default Table
