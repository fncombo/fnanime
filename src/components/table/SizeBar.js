import React from 'react'
import PropTypes from 'prop-types'

import fileSize from 'src/helpers/file-size'
import { getSizeBarColor, getSizeBarWidth } from 'src/helpers/table'

/**
 * Displays the formatted file size and a progress bar which is relative to the maximum and minimum sizes for the
 * size type (episode or total).
 */
export default function SizeBar({ size, type }) {
    if (!size || !type) {
        return <>&mdash;</>
    }

    // Get the width and color of this size bar based on the size and type
    const width = getSizeBarWidth(size, type)
    const color = getSizeBarColor(size, type)

    return (
        <>
            {fileSize(size, { round: size < 1e9 ? 0 : 2 })}
            <progress className={`progress is-${color}`} value={width} max="100" />
        </>
    )
}

SizeBar.propTypes = {
    size: PropTypes.number.isRequired,
    type: PropTypes.oneOf(['total', 'episode']).isRequired,
}