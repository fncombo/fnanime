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
        const { currentPage, animeCount, changePage } = nextProps

        // Last page based on how many anime to display
        const lastPage = Math.ceil(animeCount / Data.defaults.animePerPage)

        // If the data updated and we're over the last possible page, switch to the last page instead
        if (currentPage > lastPage && lastPage !== 0) {
            changePage(lastPage)
        }
    }

    render() {
        const { currentPage, animeCount, changePage } = this.props

        // Last page based on how many anime to display
        const lastPage = Math.ceil(animeCount / Data.defaults.animePerPage)

        // No anime or only 1 page
        if (lastPage <= 1) {
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
                    buttons.push(<Button page={previousPage + 1} currentPage={currentPage} changePage={changePage} key={previousPage + 1} />)

                // Show "..." after first page and before the last page
                // if there are more than 2 pages in between them and adjacent buttons
                } else if (page - previousPage !== 1) {
                    buttons.push(<button className="btn btn-blank mx-1" disabled={true} key={`${page}-dots`}>&hellip;</button>)
                }
            }

            buttons.push(<Button page={page} currentPage={currentPage} changePage={changePage} key={page} />)

            previousPage = page
        })

        // Add blank buttons at the start to ensure the current page button is always in the center
        if (currentPage <= Data.defaults.pageButtons + 2) {
            for (let i = 0; i <= Data.defaults.pageButtons + 2 - currentPage; i++) {
                buttons.unshift(<button className="btn btn-blank mx-1" disabled={true} key={`start-${i}-fill`} />)
            }
        }

        // Add black buttons at the end to ensure the current page button is always in the center
        if (currentPage > lastPage - Data.defaults.pageButtons - 2) {
            for (let i = lastPage + 1; i <= lastPage + Data.defaults.pageButtons + 2 - (lastPage - currentPage); i++) {
                buttons.push(<button className="btn btn-blank mx-1" disabled={true} key={`end-${i}-fill`} />)
            }
        }

        return (
            <div className="row my-3 pagination">
                <div className="col-3 pagination-prev-next">
                    <Button page={currentPage - 1} text="Previous" changePage={changePage} disabled={currentPage === 1} />
                </div>
                <div className="col-6 d-flex justify-content-center">
                    {buttons}
                </div>
                <div className="col-3 d-flex justify-content-end pagination-prev-next">
                    <Button page={currentPage + 1} text="Next" changePage={changePage} disabled={currentPage === lastPage} />
                </div>
            </div>
        )
    }
}

// Single page button
class Button extends PureComponent {
    render() {
        const { page, text, currentPage, changePage, disabled } = this.props

        // Current page button does nothing and has a unique look
        if (page === currentPage) {
            return (
                <button className="btn btn-dark mx-1">
                    {text || page}
                </button>
            )
        }

        return (
            <button className="btn btn-outline-dark mx-1" onClick={() => changePage(page)} disabled={disabled}>
                {text || page}
            </button>
        )
    }
}
