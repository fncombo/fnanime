import React, { memo, useContext } from 'react'
import PropTypes from 'prop-types'

import clone from 'clone'

import { ACTIONS, GlobalState } from 'src/data/global-state'
import { SORTING_ICONS, SORTING_ORDERS, TABLE_COLUMNS } from 'src/data/table'

import { formatOrdinal } from 'src/helpers/generic'

import Icon from 'src/components/Icon'

/**
 * Column for the table header row which can be clicked on to sort the table.
 * Clicking on already sorted column changes the sort direction.
 * If the shift key is held down, multiple columns can be added for sorting.
 */
function HeaderColumn({ children: columnName }) {
    const {
        state: { activeSorting },
        dispatch,
    } = useContext(GlobalState)

    /**
     * Callback to update sorting when clicking on a column.
     */
    function changeSortingCallback({ shiftKey }) {
        // Amending current sorting by holding shift or sorting only the currently sorted column
        // modifies existing sorting settings, otherwise create new settings
        const newSorting =
            shiftKey || (activeSorting.size === 1 && activeSorting.has(columnName)) ? clone(activeSorting) : new Map()

        // Check if this column is already being sorted, in which case reverse it,
        if (newSorting.has(columnName)) {
            newSorting.set(
                columnName,
                newSorting.get(columnName) === SORTING_ORDERS.asc ? SORTING_ORDERS.desc : SORTING_ORDERS.asc
            )

            // Otherwise add new sorting for this column and use the default direction for it
        } else {
            newSorting.set(columnName, TABLE_COLUMNS[columnName].defaultSorting)
        }

        dispatch({
            type: ACTIONS.CHANGE_SORTING,
            columnName,
            newSorting,
        })
    }

    let index
    let title = ''

    // If this column is being sorted, say so and the order of the sort
    if (activeSorting.has(columnName)) {
        // If there are multiple sorting columns, get the index this one was activated at
        if (activeSorting.size > 1) {
            const sortedColumns = [...activeSorting.keys()]

            // Do not take sorting by favorite into account when display the index of the column,
            // this is because it's actually not possible to manually sort by favorite
            if (sortedColumns.includes('favorite')) {
                sortedColumns.splice(sortedColumns.indexOf('favorite'), 1)
            }

            index = sortedColumns.indexOf(columnName) + 1

            const ordinal = formatOrdinal(index)

            title = `Sorting ${index}${ordinal} by this column in ${activeSorting.get(columnName)}ending order\n\n`
        } else {
            title = `Sorting by this column in ${activeSorting.get(columnName)}ending order\n\n`
        }
    }

    title = `${title}Hold shift to sort by multiple columns`

    const style = {
        flexBasis: TABLE_COLUMNS[columnName].size,
    }
    const icon = SORTING_ICONS[activeSorting.get(columnName)]

    return (
        <div className="table-column" style={style} onClick={changeSortingCallback} data-index={index} title={title}>
            {activeSorting.has(columnName) && <Icon icon={icon} className={`is-${activeSorting.get(columnName)}`} />}
            {TABLE_COLUMNS[columnName].text}
        </div>
    )
}

HeaderColumn.propTypes = {
    children: PropTypes.string.isRequired,
}

export default memo(HeaderColumn)
