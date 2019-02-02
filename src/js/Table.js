// React
import React, { PureComponent } from 'react'

// Style
import '../css/Table.css'

// Components
import Data from './Data'
import TableRow from './TableRow'

// Table with all the anime data
export default class Table extends PureComponent {
    render() {
        const { anime, searchQuery, currentPage, update, openInfoBox, activeSorting } = this.props

        return (
            <table className="table table-anime mt-3">
                <thead title="Hold shift to sort by multiple columns">
                    <tr>
                        <TableHeaders update={update} activeSorting={activeSorting} />
                    </tr>
                </thead>
                <tbody>
                    {anime.slice((currentPage - 1) * Data.defaults.animePerPage, currentPage * Data.defaults.animePerPage).map(anime =>
                        <TableRow anime={anime} searchQuery={searchQuery} openInfoBox={openInfoBox} key={anime.hash} />
                    )}
                </tbody>
            </table>
        )
    }
}

class TableHeaders extends PureComponent {
    smallColumn = '5%'
    mediumColumn = '8%'
    largeColumn = '12%'

    // Columns setup
    columns = {
        title: {
            text: 'Title',
            defaultSorting: 'asc',
            size: 'auto',
        },
        status: {
            text: 'Status',
            defaultSorting: 'asc',
            size: this.largeColumn,
        },
        rating: {
            text: 'Rating',
            defaultSorting: 'desc',
            size: this.smallColumn,
        },
        rewatchCount: {
            text: 'Rewatched',
            defaultSorting: 'desc',
            size: this.mediumColumn,
        },
        subs: {
            text: 'Subtitles',
            defaultSorting: 'asc',
            size: this.mediumColumn,
        },
        resolution: {
            text: 'Resolution',
            defaultSorting: 'desc',
            size: this.mediumColumn,
        },
        source: {
            text: 'Source',
            defaultSorting: 'desc',
            size: this.smallColumn,
        },
        videoCodec: {
            text: 'Video',
            defaultSorting: 'desc',
            size: this.smallColumn,
        },
        audioCodec: {
            text: 'Audio',
            defaultSorting: 'desc',
            size: this.smallColumn,
        },
        episodeSize: {
            text: 'Episode Size',
            defaultSorting: 'desc',
            size: this.mediumColumn,
        },
        size: {
            text: 'Total Size',
            defaultSorting: 'desc',
            size: this.mediumColumn,
        },
    }

    // Apply the correct sorting class names to each column header
    headerClass(column) {
        const { activeSorting } = this.props

        return activeSorting.hasOwnProperty(column) ? `sort-${activeSorting[column]}` : ''
    }

    // Sort when clicking on a column header
    sortColumn(column, defaultDirection, ammend) {
        const { update, activeSorting } = this.props

        // Ammending current sorting or sorting only the currently sorted column modifies existing sorting settings, otherwise create new settings
        let newSorting = (ammend || (Object.keys(activeSorting).length === 1 && activeSorting.hasOwnProperty(column))) ? Object.assign({}, activeSorting) : {}

        // Check if this column is already being sorted, in which case reverse it, otherwise use default sorting for that column
        if (newSorting.hasOwnProperty(column)) {
            newSorting[column] = newSorting[column] === 'asc' ? 'desc' : 'asc'

        // Add new sorting
        } else {
            newSorting[column] = defaultDirection
        }

        update('activeSorting', newSorting)
    }

    render() {
        return Object.entries(this.columns).map(([column, settings]) =>
            <th
                className={this.headerClass(column)}
                style={{ width: settings.size }}
                onClick={event => this.sortColumn(column, settings.defaultSorting, event.shiftKey)}
                key={column}
            >
                {settings.text}
            </th>
        )
    }
}