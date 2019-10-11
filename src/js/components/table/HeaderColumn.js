// React
import React, { memo, useContext } from 'react'

// Libraries
import clone from 'clone'

// Data
import { GlobalState, ACTIONS } from 'js/data/GlobalState'
import { TABLE_COLUMNS, SORTING_ORDERS, SORTING_ICONS } from 'js/data/Table'

// Helpers
import { formatOrdinal } from 'js/helpers/Table'

// Components
import Icon from 'js/components/Icon'

/**
 * Column for the table header row which can be clicked on to sort the table.
 * Clicking on already sorted column changes the sort direction.
 * If the shift key is held down, multiple columns can be added for sorting.
 */
const HeaderColumn = memo(({ columnName }) => {
    const { state: { activeSorting }, dispatch } = useContext(GlobalState)

    // Callback to update sorting when clicking on a column
    const changeSorting = ({ shiftKey }) => {
        // Amending current sorting by holding shift or sorting only the currently sorted column
        // modifies existing sorting settings, otherwise create new settings
        const newSorting = shiftKey || (
            activeSorting.size === 1 && activeSorting.has(columnName)
        ) ? clone(activeSorting) : new Map()

        // Check if this column is already being sorted, in which case reverse it,
        // otherwise use the default sorting for it
        if (newSorting.has(columnName)) {
            newSorting.set(
                columnName,
                newSorting.get(columnName) === SORTING_ORDERS.asc ? SORTING_ORDERS.desc : SORTING_ORDERS.asc
            )

        // Add new sorting for this column because it isn't being sorted yet
        } else {
            newSorting.set(columnName, TABLE_COLUMNS[columnName].defaultSorting)
        }

        dispatch({
            type: ACTIONS.CHANGE_SORTING,
            columnName,
            newSorting,
        })
    }

    let index = ''
    let title = ''

    // If this column is being sorted, say so and the order of the sort
    if (activeSorting.has(columnName)) {
        // If there are multiple sorting columns, get the index this one was activated at
        if (activeSorting.size > 1) {
            const sortedColumns = [ ...activeSorting.keys() ]

            // Do not take sorting by favorite into account when display the index of the column,
            // this is because it's actually not possible to manually sort by favorite
            if (sortedColumns.includes('favorite')) {
                sortedColumns.splice(sortedColumns.indexOf('favorite'), 1)
            }

            index = sortedColumns.indexOf(columnName) + 1

            const ordinal = formatOrdinal(index)

            title = `Sorting ${index}${ordinal} by this column in ${activeSorting.get(columnName)}ending order.\n\n`
        } else {
            title = `Sorting by this column in ${activeSorting.get(columnName)}ending order.\n\n`
        }
    }

    title = `${title}Hold shift to sort by multiple columns.`

    const flexBasis = TABLE_COLUMNS[columnName].size

    return (
        <div className="table-column" style={{ flexBasis }} onClick={changeSorting} data-index={index} title={title}>
            {activeSorting.has(columnName) &&
                <Icon
                    icon={SORTING_ICONS[activeSorting.get(columnName)]}
                    className={`is-${activeSorting.get(columnName)}`}
                />
            }
            {TABLE_COLUMNS[columnName].text}
        </div>
    )
})

export default HeaderColumn
