// React
import React, { memo } from 'react'

// Libraries
import classNames from 'classnames'

// Data
import { TABLE_COLUMN_NAMES } from 'js/data/Table'

// Components
import StuckSentinel from '../StuckSentinel'
import HeaderColumn from 'js/components/table/HeaderColumn'

/**
 * Table header row which becomes stuck to the top of the page and gains additional styling when scrolling.
 */
const Header = memo(() =>
    <StuckSentinel className="table-sentinel">
        {isStuck =>
            <div className={classNames('table-header', { 'is-stuck': isStuck })}>
                {TABLE_COLUMN_NAMES.map(columnName =>
                    <HeaderColumn key={columnName}>
                        {columnName}
                    </HeaderColumn>
                )}
            </div>
        }
    </StuckSentinel>
)

// Exports
export default Header
