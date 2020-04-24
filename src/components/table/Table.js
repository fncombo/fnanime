import React, { useContext, useReducer } from 'react'

import { DEFAULTS } from 'src/data/data'
import { ACTIONS, GlobalState, TableState } from 'src/data/global-state'

import Icon from 'src/components/Icon'
import Pagination from 'src/components/pagination/Pagination'
import Header from 'src/components/table/Header'
import Row from 'src/components/table/Row'

import 'src/styles/Table.scss'

// Default table state
const INITIAL_TABLE_STATE = {
    page: 1,
}

/**
 * Table state reducer.
 */
function tableStateReducer(state, { type, page }) {
    switch (type) {
        case ACTIONS.NEXT_PAGE:
            return { page: state.page + 1 }

        case ACTIONS.PREV_PAGE:
            return { page: state.page - 1 }

        case ACTIONS.SET_PAGE:
            return { page }

        default:
            return state
    }
}

/**
 * Table showing all the currently filtered and searched anime with pagination.
 */
export default function Table() {
    const {
        state: { anime: allAnime },
    } = useContext(GlobalState)
    const [state, dispatch] = useReducer(tableStateReducer, INITIAL_TABLE_STATE)

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

    // Calculate the last possible page number based on the total number of anime and how many are displayed per page
    const lastPage = Math.ceil(allAnime.length / DEFAULTS.perPage)

    return (
        <TableState.Provider value={{ state, dispatch, lastPage }}>
            <div className="container">
                <div className="table">
                    <Header />
                    {allAnime.slice((state.page - 1) * DEFAULTS.perPage, state.page * DEFAULTS.perPage).map((anime) => (
                        <Row key={anime.id} anime={anime} />
                    ))}
                    <Pagination />
                </div>
            </div>
        </TableState.Provider>
    )
}
