// React
import React, { useContext } from 'react'

// Style
import 'scss/Pagination.scss'

// Data
import { TableState, ACTIONS } from 'js/data/GlobalState'

/**
 * Single page button with a number which takes you to that page when clicked.
 */
function NumberButton({ children: pageNumber }) {
    const { state: { page }, dispatch } = useContext(TableState)

    // Callback to switch the table to a specific page
    const changePage = () => {
        dispatch({
            type: ACTIONS.SET_PAGE,
            page: pageNumber,
        })
    }

    // Current page button does nothing and has a unique look
    if (pageNumber === page) {
        return <button className="button is-dark is-rounded">{pageNumber}</button>
    }

    return <button className="button is-rounded" onClick={changePage}>{pageNumber}</button>
}

export default NumberButton
