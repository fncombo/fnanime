import React, { useContext } from 'react'

import 'src/styles/Pagination.scss'

import { TableState } from 'src/data/GlobalState'
import { DEFAULTS } from 'src/data/Data'

import NumberButton from 'src/components/pagination/NumberButton'

/**
 * Number buttons to navigate the table. Some number buttons are truncated when the are too many between the current
 * button and the first/last page button.
 */
export default function PageNumberButtons() {
    const {
        state: { page },
        lastPage,
    } = useContext(TableState)

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
            buttons.push(
                <span className="pagination-ellipsis" key={`${pageNumber}-ellipsis`}>
                    &hellip;
                </span>
            )
        }

        buttons.push(<NumberButton key={pageNumber}>{pageNumber}</NumberButton>)

        previousPage = pageNumber
    }

    // Add blank buttons at the start to ensure the current page button is always exactly in the middle
    if (page <= DEFAULTS.pageButtons + 2) {
        for (let i = 0; i <= DEFAULTS.pageButtons + 2 - page; i += 1) {
            buttons.unshift(<button type="button" className="button" disabled key={`start-${i}-fill`} />)
        }
    }

    // Add blank buttons at the end to ensure the current page button is always exactly in the middle
    if (page > lastPage - DEFAULTS.pageButtons - 2) {
        for (let i = lastPage + 1; i <= lastPage + DEFAULTS.pageButtons + 2 - (lastPage - page); i += 1) {
            buttons.push(<button type="button" className="button" disabled key={`end-${i}-fill`} />)
        }
    }

    return buttons
}
