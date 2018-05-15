// React
import React, { PureComponent } from 'react'

// Style
import '../css/Pagination.css'

// Page buttons to control the table
export default class Pagination extends PureComponent {
    constructor() {
        super()

        // How many buttons to show on each side of the current page button
        this.buttonCount = 2
    }

    // Check if the current page more than the last page when the data changes
    componentWillUpdate(nextProps) {
        const { page, totalAnime, perPage, changePage } = nextProps

        // Last page based on how many anime to display
        const lastPage = Math.ceil(totalAnime / perPage)

        if (page > lastPage && lastPage !== 0) {
            changePage(lastPage)
        }
    }

    // Single button
    button(pageNumber) {
        const { page, changePage } = this.props

        // Current page button does nothing and has a unique look
        if (pageNumber === page) {
            return (
                <button className="btn btn-primary" key={pageNumber}>
                    {pageNumber}
                </button>
            )
        }

        return (
            <button className="btn btn-secondary" onClick={() => changePage(pageNumber)} key={pageNumber}>
                {pageNumber}
            </button>
        )
    }

    render() {
        const { page, totalAnime, perPage, changePage } = this.props

        // Last page based on how many anime to display
        const lastPage = Math.ceil(totalAnime / perPage)

        // No anime to display
        if (lastPage === 0) {
            return null
        }

        // The lowest and highest page button numbers on each side of the current page
        const leftPage = page - this.buttonCount
        const rightPage = page + this.buttonCount + 1

        // All pages to display
        let pages = []
        let buttons = []
        let previousPage = false

        // Create the needed page numbers
        // First page, last page, all pages between left most and right most pages
        for (let i = 1; i <= lastPage; i++) {
            if (i === 1 || i === lastPage || (i >= leftPage && i < rightPage)) {
                pages.push(i)
            }
        }

        // Create the buttons and "..." between the first button,
        // last button, and the middle button group
        pages.forEach(page => {
            if (previousPage) {
                if (page - previousPage === 2) {
                    buttons.push(this.button(previousPage + 1))
                    // Show "..." after first page and before the last page
                    // if there are more than 2 pages in between them and adjacent buttons
                } else if (page - previousPage !== 1) {
                    buttons.push(<span key={`${page}-dots`}>&hellip;</span>)
                }
            }

            buttons.push(this.button(page))

            previousPage = page
        })

        return (
            <div className="pagination">
                <button
                    className={`btn ${page === 1 ? 'btn-disabled' : 'btn-secondary'}`}
                    onClick={() => changePage(page - 1)} disabled={page === 1}
                >
                    Previous
                </button>
                {buttons}
                <button
                    className={`btn ${page === lastPage ? 'btn-disabled' : 'btn-secondary'}`}
                    onClick={() => changePage(page + 1)} disabled={page === lastPage}
                >
                    Next
                </button>
            </div>
        )
    }
}