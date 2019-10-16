// React
import React, { useContext } from 'react'

// Libraries
import classNames from 'classnames'

// Style
import 'scss/Pagination.scss'

// Data
import { TableState, ACTIONS } from 'js/data/GlobalState'

// Components
import StuckSentinel from 'js/components/StuckSentinel'
import NavigationButton from 'js/components/pagination/NavigationButton'
import PageNumberButtons from 'js/components/pagination/PageNumberButtons'

/**
 * Previous, next, and number buttons to control the table.
 */
function Pagination() {
    const { state: { page }, dispatch, lastPage } = useContext(TableState)

    // If the anime updated and the table is now over the last possible page, switch to the new last page instead
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
        <StuckSentinel className="pagination-sentinel">
            {(isStuck =>
                <div className={classNames('columns pagination', { 'is-stuck': isStuck })}>
                    <div className="column is-3">
                        <NavigationButton action={ACTIONS.PREV_PAGE} disabled={page === 1} />
                    </div>
                    <div className="column is-6 pagination-list is-hidden-tablet">
                        Page {page} of {lastPage}
                    </div>
                    <div className="column is-6 pagination-list is-hidden-mobile">
                        <PageNumberButtons />
                    </div>
                    <div className="column is-3">
                        <NavigationButton action={ACTIONS.NEXT_PAGE} disabled={page === lastPage} />
                    </div>
                </div>
            )}
        </StuckSentinel>
    )
}

// Exports
export default Pagination
