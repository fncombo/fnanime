import React, { useCallback, useContext } from 'react'
import PropTypes from 'prop-types'

import { ACTIONS, TableState } from 'src/helpers/global-state'

import 'src/styles/Pagination.scss'

/**
 * Single page button with a number which takes you to that page when clicked.
 */
export default function NumberButton({ children: pageNumber }) {
    const {
        state: { page },
        dispatch,
    } = useContext(TableState)

    // Callback to switch the table to a specific page
    const setPageCallback = useCallback(() => {
        dispatch({
            type: ACTIONS.SET_PAGE,
            page: pageNumber,
        })
    }, [dispatch, pageNumber])

    // Current page button does nothing and has a unique look, normal page button takes to the page on click
    return pageNumber === page ? (
        <button type="button" className="button is-rounded is-dark">
            {pageNumber}
        </button>
    ) : (
        <button type="button" className="button is-rounded" onClick={setPageCallback}>
            {pageNumber}
        </button>
    )
}

NumberButton.propTypes = {
    children: PropTypes.number.isRequired,
}
