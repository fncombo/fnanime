// React
import React, { useContext } from 'react'

// Libraries
import classNames from 'classnames'
import { useInView } from 'react-intersection-observer'

// Style
import 'scss/Pagination.scss'

// Data
import { TableState, ACTIONS } from 'js/data/GlobalState'
import { DEFAULTS } from 'js/data/Data'

// Helpers
import Icon from 'js/helpers/Icon'

/**
 * Previous, next, and number buttons to control the table.
 */
function Pagination() {
    const { state: { page }, dispatch, lastPage } = useContext(TableState)
    const [ ref, inView, entry ] = useInView()

    // Check whether the pagination is stuck to add additional styling
    const classes = classNames('columns pagination', {
        'is-stuck': !inView && entry,
    })

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

    return (
        <>
            <div className="pagination-sentinel" ref={ref} />
            <div className={classes}>
                <div className="column is-3">
                    <NavButton action={ACTIONS.PREV_PAGE} disabled={page === 1} />
                </div>
                <div className="column is-6 pagination-list">
                    <PageNumberButtons />
                </div>
                <div className="column is-3">
                    <NavButton action={ACTIONS.NEXT_PAGE} disabled={page === lastPage} />
                </div>
            </div>
        </>
    )
}

/**
 * Number buttons to control the table. Some number buttons are truncated when the are too many between the current
 * and first/last page.
 */
function PageNumberButtons() {
    const { state: { page }, lastPage } = useContext(TableState)

    // The lowest and highest page button numbers on either side of the current page
    const leftPage = page - DEFAULTS.pageButtons
    const rightPage = page + DEFAULTS.pageButtons + 1

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

    for (const pageNumber of pageNumbers) {
        if (pageNumber - previousPage === 2) {
            buttons.push(<NumberButton key={previousPage + 1}>{previousPage + 1}</NumberButton>)

        // Show "..." after first page and before the last page if there are more than 2 pages
        // in between them and adjacent buttons
        } else if (pageNumber - previousPage !== 1) {
            buttons.push(<span className="pagination-ellipsis" key={`${pageNumber}-ellipsis`}>&hellip;</span>)
        }

        buttons.push(<NumberButton key={pageNumber}>{pageNumber}</NumberButton>)

        previousPage = pageNumber
    }

    // Add blank buttons at the start to ensure the current page button is always exactly in the middle
    if (page <= DEFAULTS.pageButtons + 2) {
        for (let i = 0; i <= DEFAULTS.pageButtons + 2 - page; i += 1) {
            buttons.unshift(<button className="button" disabled={true} key={`start-${i}-fill`} />)
        }
    }

    // Add blank buttons at the end to ensure the current page button is always exactly in the middle
    if (page > lastPage - DEFAULTS.pageButtons - 2) {
        for (let i = lastPage + 1; i <= lastPage + DEFAULTS.pageButtons + 2 - (lastPage - page); i += 1) {
            buttons.push(<button className="button" disabled={true} key={`end-${i}-fill`} />)
        }
    }

    return buttons
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
        return <button className="button is-dark is-rounded">{pageNumber}</button>
    }

    return <button className="button is-rounded" onClick={changePage}>{pageNumber}</button>
}

/**
 * Next and previous page button simply send an action type to the reducer.
 */
function NavButton({ action: type, disabled = false }) {
    const { dispatch } = useContext(TableState)

    const changePage = () => {
        dispatch({ type })
    }

    const icon = type === ACTIONS.PREV_PAGE ? 'chevron-left' : 'chevron-right'
    const classes = classNames(type === ACTIONS.PREV_PAGE ? 'is-left' : 'is-right', {
        'is-disabled': disabled,
    })

    return disabled ? null : <Icon as="button" icon={icon} className={classes} onClick={changePage} />
}

// Exports
export default Pagination
