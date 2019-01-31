// Libraries
import ClassNames from 'classnames'

// React
import React, { PureComponent } from 'react'

// Style
import '../css/Pagination.css'

// Components
import Data from './Data'

// Page buttons to control the table
export default class Pagination extends PureComponent {
    // Check if the current page is further than the last page when the data changes
    componentWillUpdate(nextProps) {
        const { currentPage, totalAnime, changePage } = nextProps

        // Last page based on how many anime to display
        const lastPage = Math.ceil(totalAnime / Data.defaults.perPage)

        // If the data updated and we're over the last possible page, switch to the last page instead
        if (currentPage > lastPage && lastPage !== 0) {
            changePage(lastPage)
        }
    }

    render() {
        const { currentPage, totalAnime, changePage } = this.props

        // Last page based on how many anime to display
        const lastPage = Math.ceil(totalAnime / Data.defaults.perPage)

        // No anime to display
        if (lastPage === 0) {
            return null
        }

        // The lowest and highest page button numbers on each side of the current page
        const leftPage = currentPage - Data.defaults.pageButtons
        const rightPage = currentPage + Data.defaults.pageButtons + 1

        // All pages to display
        let pages = []
        let buttons = []
        let previousPage = false

        // Create the needed page numbers
        for (let i = 1; i <= lastPage; i++) {
            // First page, last page, all pages between left most and right most pages
            if (i === 1 || i === lastPage || (i >= leftPage && i < rightPage)) {
                pages.push(i)
            }
        }

        // Create the buttons and "..." between the first button, last button, and the middle button group
        pages.forEach(page => {
            if (previousPage) {
                if (page - previousPage === 2) {
                    buttons.push(<Button buttonPage={previousPage + 1} currentPage={currentPage} changePage={changePage} key={previousPage + 1} />)

                // Show "..." after first page and before the last page
                // if there are more than 2 pages in between them and adjacent buttons
                } else if (page - previousPage !== 1) {
                    buttons.push(<span key={`${page}-dots`}>&hellip;</span>)
                }
            }

            buttons.push(<Button buttonPage={page} currentPage={currentPage} changePage={changePage} key={page} />)

            previousPage = page
        })

        // Previous and next button classes
        const prevButtonClasses = ClassNames('btn', 'btn-secondary', {
            'btn-disabled': currentPage === 1,
        })

        const nextButtonClasses = ClassNames('btn', 'btn-secondary', {
            'btn-disabled': currentPage === lastPage,
        })

        return (
            <div className="pagination">
                <button className={prevButtonClasses} onClick={() => changePage(currentPage - 1)} disabled={currentPage === 1}>
                    Previous
                </button>
                {buttons}
                <button className={nextButtonClasses} onClick={() => changePage(currentPage + 1)} disabled={currentPage === lastPage}>
                    Next
                </button>
            </div>
        )
    }
}

// Single page button
class Button extends PureComponent {
    render() {
        const { buttonPage, currentPage, changePage } = this.props

        // Current page button does nothing and has a unique look
        if (buttonPage === currentPage) {
            return (
                <button className="btn btn-primary">
                    {buttonPage}
                </button>
            )
        }

        return (
            <button className="btn btn-secondary" onClick={() => changePage(buttonPage)}>
                {buttonPage}
            </button>
        )
    }
}