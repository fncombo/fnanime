// React
import React, { memo } from 'react'

// Libraries
import classNames from 'classnames'
import { useInView } from 'react-intersection-observer'

// Data
import { TABLE_COLUMN_NAMES } from 'js/data/Table'

// Components
import HeaderColumn from 'js/components/table/HeaderColumn'

/**
 * Table header row which becomes stuck to the top of the page and
 * gains additional styling when scrolling.
 */
const Header = memo(() => {
    const [ ref, inView, entry ] = useInView()

    // Check whether the table header is stuck to add additional styling
    const classes = classNames('table-header', {
        'is-stuck': !inView && entry,
    })

    return (
        <>
            <div className="table-sentinel" ref={ref} />
            <div className={classes}>
                {TABLE_COLUMN_NAMES.map(columnName =>
                    <HeaderColumn columnName={columnName} key={columnName} />
                )}
            </div>
        </>
    )
})

export default Header
