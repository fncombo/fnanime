// React
import React, { PureComponent, Fragment } from 'react'

// Components
import TableRow from './TableRow'
import Pagination from './Pagination'

// Style
import '../css/Table.css'

// Data
import data from './data.json'

// Table with all the anime data
export default class Table extends PureComponent {
    // Anime to show per page
    perPage = 25

    // Sort when clicking on a column header
    sortColumn(column, defaultDirection, ammend) {
        const { update, getSorting } = this.props

        // Ammending (by holding shift) or sorting only the current sorted column modifies the existing sorting
        let sort = (ammend || (
                getSorting().length === 1 && getSorting()[0].field === column
            )
        ) ? Object.assign([], getSorting()) : []

        // Check if this column is already being sorted,
        // in which case reverse it, otherwise use default sorting for that column
        if (sort.some(sort => sort.field === column)) {
            // Get the index of the sort setting
            let index = sort.findIndex(sort => sort.field === column)
            sort[index].direction = sort[index].direction === 'asc' ? 'desc' : 'asc'
        // Add new sorting
        } else {
            sort.push({
                field: column,
                direction: defaultDirection,
            })
        }

        update('sort', sort)
    }

    // Apply the correct sorting class names to table header columns
    columClassName(column) {
        const { getSorting } = this.props

        // If no sorting active
        if (!getSorting().length) {
            return
        }

        // Check if any of the sort fields match the column name
        if (getSorting().some(sort => sort.field === column)) {
            // Figure out the order (desc or asc)
            return getSorting().filter(sort => sort.field === column).map(sort => `sort-${sort.direction}`)
        }
    }

    render() {
        const { anime, searchQuery, page, openInfoBox, changePage } = this.props

        return (
            <Fragment>
                <table className="table table-striped table-hover mt-3" style={{width: '100%'}}>
                    <thead title="Hold shift to sort multiple columns">
                        <tr>
                            {Object.entries(data.columns).map(([name, column]) =>
                                <th
                                    className={this.columClassName(name)}
                                    style={{width: column.size}}
                                    onClick={event => this.sortColumn(name, column.defaultSort, event.shiftKey)}
                                    key={name}
                                >
                                    {column.name}
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {anime.slice((page - 1) * this.perPage, page * this.perPage).map(anime =>
                            <TableRow anime={anime} searchQuery={searchQuery} openInfoBox={openInfoBox} key={anime.id} />
                        )}
                    </tbody>
                </table>
                <Pagination page={page} totalAnime={anime.length} perPage={this.perPage} changePage={changePage} />
            </Fragment>
        )
    }
}