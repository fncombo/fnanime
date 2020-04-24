import React from 'react'

import { TABLE_COLUMNS } from 'src/data/Table'

import { getColumnTextColor } from 'src/helpers/Table'

/**
 * Generic table cell with anime data. The text is color coded if mapping for data to color are found for this column.
 */
export default function Column({ value, columnName, children }) {
    // Try to get the column's text color of they are defined
    const textColor = getColumnTextColor(columnName, value || children)

    // Styles for the column width on desktop and grid position on mobile
    const style = {
        flexBasis: TABLE_COLUMNS[columnName].size,
        gridArea: columnName,
    }

    // If no value is provided, check if there are children, otherwise check if the value is truthy
    // If there are children or the value is truthy, try to use the children, falling back to the value
    // If neither children nor value could be used, fallback to a dash
    return (
        <div className={`table-column has-text-${textColor} is-${columnName}`} style={style}>
            {(value === undefined ? children : value) ? children || value : <>&mdash;</>}
        </div>
    )
}
