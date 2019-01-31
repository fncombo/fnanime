// React
import React, { PureComponent } from 'react'

// Components
import TableRow from './TableRow'

// Style
import '../css/Table.css'
import Data from './Data'

// Table with all the anime data
export default class Table extends PureComponent {
    render() {
        const { anime, searchQuery, currentPage, update, openInfoBox, sorting } = this.props

        return (
            <table className="table mt-3" style={{ width: '100%' }}>
                <thead title="Hold shift to sort multiple columns">
                    <tr>
                        <TableHeaders update={update} sorting={sorting} />
                    </tr>
                </thead>
                <tbody>
                    {anime.slice((currentPage - 1) * Data.defaults.perPage, currentPage * Data.defaults.perPage).map(anime =>
                        <TableRow anime={anime} searchQuery={searchQuery} openInfoBox={openInfoBox} key={anime.hash} />
                    )}
                </tbody>
            </table>
        )
    }
}

class TableHeaders extends PureComponent {
    // Columns setup
    columns = {
        title: {
            text: 'Title',
            defaultSort: 'asc',
            size: 'auto',
        },
        status: {
            text: 'Status',
            defaultSort: 'asc',
            size: '13%',
        },
        subs: {
            text: 'Subtitles',
            defaultSort: 'asc',
            size: '11%',
        },
        resolution: {
            text: 'Resolution',
            defaultSort: 'desc',
            size: '9%',
        },
        source: {
            text: 'Source',
            defaultSort: 'asc',
            size: '7%',
        },
        rating: {
            text: 'Rating',
            defaultSort: 'desc',
            size: '7%',
        },
        rewatchCount: {
            text: 'Rewatched',
            defaultSort: 'desc',
            size: '9%',
        },
        size: {
            text: 'Size',
            defaultSort: 'desc',
            size: '9%',
        },
    }

    // Apply the correct sorting class names to each column header
    headerClass(column) {
        const { sorting } = this.props

        // If no sorting active or no curently sorted columns match this column
        if (!sorting.length || !sorting.some(sort => sort.field === column)) {
            return null
        }

        // Figure out the order (desc or asc) and return the class name
        return sorting.filter(sort => sort.field === column).map(sort => `sort-${sort.direction}`)
    }

    // Sort when clicking on a column header
    sortColumn(column, defaultDirection, ammend) {
        const { update, sorting } = this.props

        // Ammending (by holding shift) or sorting only the current sorted column modifies the existing sorting
        let sort = (ammend || (
            sorting.length === 1 && sorting[0].field === column
        )) ? Object.assign([], sorting) : []

        // Check if this column is already being sorted, in which case reverse it, otherwise use default sorting for that column
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

        update('sorting', sort)
    }

    render() {
        return Object.entries(this.columns).map(([name, column]) =>
            <th className={this.headerClass(name)} style={{ width: column.size }} onClick={event => this.sortColumn(name, column.defaultSort, event.shiftKey)} key={name}>
                {column.text}
            </th>
        )
    }
}