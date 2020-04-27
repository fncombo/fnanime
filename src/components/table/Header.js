import React, { memo } from 'react'

import classNames from 'classnames'

import { TABLE_COLUMN_NAMES } from 'src/helpers/table'

import StuckSentinel from 'src/components/StuckSentinel'
import HeaderColumn from 'src/components/table/HeaderColumn'

/**
 * Table header row which becomes stuck to the top of the page and gains additional styling when scrolling.
 */
function Header() {
    return (
        <StuckSentinel className="table-sentinel">
            {(isStuck) => (
                <div className={classNames('table-header', { 'is-stuck': isStuck })}>
                    {TABLE_COLUMN_NAMES.map((columnName) => (
                        <HeaderColumn key={columnName}>{columnName}</HeaderColumn>
                    ))}
                </div>
            )}
        </StuckSentinel>
    )
}

export default memo(Header)
