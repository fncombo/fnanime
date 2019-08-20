// React
import React, { memo, useContext } from 'react'

// Style
import '../../scss/Pagination.scss'

// Data
import { TableState, ACTIONS } from '../data/GlobalState'
import { Defaults } from '../data/Data'

/**
 * Previous, next, and number button to control the table.
 */
function Pagination() {
    const { state: { page }, dispatch, lastPage } = useContext(TableState)

    // If the anime updated and the table is now over the last possible page,
    // switch to the new last page instead
    if (page > lastPage && lastPage !== 0) {
        dispatch({
            type: ACTIONS.SET_PAGE,
            page: lastPage,
        })

        return null
    }

    // No anime or only one page
    if (lastPage <= 1) {
        return null
    }

    // The lowest and highest page button numbers on either side of the current page
    const leftPage = page - Defaults.pageButtons
    const rightPage = page + Defaults.pageButtons + 1

    // All pages to display
    const pageNumbers = []
    const buttons = []

    // Create the needed page numbers
    for (let i = 1; i <= lastPage; i += 1) {
        // First page, last page, all pages between left most and right most pages
        if (i === 1 || i === lastPage || (i >= leftPage && i < rightPage)) {
            pageNumbers.push(i)
        }
    }

    // Create the buttons and "..." between the first button, last button, and the middle button group
    let previousPage = false

    pageNumbers.forEach(pageNumber => {
        if (previousPage) {
            if (pageNumber - previousPage === 2) {
                buttons.push(<NumberButton key={previousPage + 1}>{previousPage + 1}</NumberButton>)

            // Show "..." after first page and before the last page if there are more than 2 pages
            // in between them and adjacent buttons
            } else if (pageNumber - previousPage !== 1) {
                buttons.push(<span className="pagination-ellipsis" key={`${pageNumber}-ellipsis`}>&hellip;</span>)
            }
        }

        buttons.push(<NumberButton key={pageNumber}>{pageNumber}</NumberButton>)

        previousPage = pageNumber
    })

    // Add blank buttons at the start to ensure the current page button is always exactly in the middle
    if (page <= Defaults.pageButtons + 2) {
        for (let i = 0; i <= Defaults.pageButtons + 2 - page; i += 1) {
            buttons.unshift(<button className="button" disabled={true} key={`start-${i}-fill`} />)
        }
    }

    // Add blank buttons at the end to ensure the current page button is always exactly in the middle
    if (page > lastPage - Defaults.pageButtons - 2) {
        for (let i = lastPage + 1; i <= lastPage + Defaults.pageButtons + 2 - (lastPage - page); i += 1) {
            buttons.push(<button className="button" disabled={true} key={`end-${i}-fill`} />)
        }
    }

    return (
        <div className="columns pagination">
            <div class="column">
                <TextButton action={ACTIONS.PREV_PAGE} disabled={page === 1}>Previous</TextButton>
            </div>
            <div className="column is-6 pagination-list">{buttons}</div>
            <div className="column">
                <TextButton action={ACTIONS.NEXT_PAGE} disabled={page === lastPage}>Next</TextButton>
            </div>
        </div>
    )
}

/**
 * Single page button with a number which takes you to that page when clicked.
 */
function NumberButton({ children: pageNumber }) {
    const { state: { page }, dispatch } = useContext(TableState)

    const changePage = () => {
        dispatch({
            type: ACTIONS.SET_PAGE,
            page: pageNumber,
        })
    }

    // Current page button does nothing and has a unique look
    if (pageNumber === page) {
        return <button className="button is-dark">{pageNumber}</button>
    }

    return <button className="button" onClick={changePage}>{pageNumber}</button>
}

/**
 * Next and previous page button simply send an action type to the reducer.
 */
const TextButton = memo(({ action: type, disabled = false, children }) => {
    const { dispatch } = useContext(TableState)

    const changePage = () => {
        dispatch({ type })
    }

    if (disabled) {
        return <button className="button" disabled={disabled}>{children}</button>
    }

    return <button className="button" onClick={changePage}>{children}</button>
})

// Exports
export default Pagination
