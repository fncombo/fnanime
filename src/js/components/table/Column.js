// React
import React from 'react'

// Data
import { TABLE_COLUMNS } from 'js/data/Table'

// Helpers
import { getColumnTextColor } from 'js/helpers/Table'

/**
 * Generic table column with anime data. The text is color coded if
 * mapping for data to color are found for this column.
 */
function Column({ value, columnName, children }) {
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

export default Column
