// React
import React, { useContext } from 'react'

// Style
import 'scss/Pagination.scss'

// Data
import { TableState, ACTIONS } from 'js/data/GlobalState'

/**
 * Single page button with a number which takes you to that page when clicked.
 */
export default function NumberButton({ children: pageNumber }) {
    const { state: { page }, dispatch } = useContext(TableState)

    // Callback to switch the table to a specific page
    function setPageCallback() {
        dispatch({
            type: ACTIONS.SET_PAGE,
            page: pageNumber,
        })
    }

    // Current page button does nothing and has a unique look, normal page button takes to the page on click
    return pageNumber === page
        ? <button className="button is-rounded is-dark">{pageNumber}</button>
        : <button className="button is-rounded" onClick={setPageCallback}>{pageNumber}</button>
}
