import React from 'react'
import PropTypes from 'prop-types'

import { TABLE_COLUMNS } from 'src/helpers/table'

import SizeBar from 'src/components/table/SizeBar'

/**
 * Displays either two columns showing the size per episode and total size of the anime,
 * or one column which spans two columns if both sizes are the same.
 */
export default function SizeColumns({ episodeSize, size }) {
    // If the size is the same, only create one column which spans the width of 2
    if (size === episodeSize) {
        // Add the widths of both columns
        const width = parseInt(TABLE_COLUMNS.episodeSize.size, 10) + parseInt(TABLE_COLUMNS.size.size, 10)

        // Styles for the single column width on desktop and grid position on mobile
        const style = {
            flexBasis: `${width}%`,
            gridArea: 'episodeSize / episodeSize / episodeSize / size',
        }

        return (
            <div className="table-column has-progress is-double" style={style}>
                <SizeBar size={size} type="total" />
            </div>
        )
    }

    // Styles for the each column's width on desktop and grid position on mobile
    const episodeSizeStyle = {
        flexBasis: TABLE_COLUMNS.episodeSize.size,
        gridArea: 'episodeSize',
    }
    const sizeStyle = {
        flexBasis: TABLE_COLUMNS.size.size,
        gridArea: 'size',
    }

    return (
        <>
            <div className="table-column has-progress" style={episodeSizeStyle}>
                <SizeBar size={episodeSize} type="episode" />
            </div>
            <div className="table-column has-progress" style={sizeStyle}>
                <SizeBar size={size} type="total" />
            </div>
        </>
    )
}

SizeColumns.propTypes = {
    episodeSize: PropTypes.number.isRequired,
    size: PropTypes.number.isRequired,
}
