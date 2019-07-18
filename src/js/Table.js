// React
import React, { Component, PureComponent } from 'react'

// Style
import '../css/Table.css'

// Components
import Data from './Data'
import TableRow from './TableRow'

// Table with all the anime data
export default class Table extends Component {
    state = {
        stuck: false,
    }

    componentDidMount() {
        // Check when the table header becomes stuck
        window.addEventListener('scroll', () => {
            // Get the positions of the header row and the first normal row
            const tableHeader = document.querySelector('.table-header').getBoundingClientRect()
            const tableFirstRow = document.querySelector('.table .table-row:not(.table-header)').getBoundingClientRect()

            // If they passed each other, the header is stuck
            if (tableHeader.y + tableHeader.height > tableFirstRow.y) {
                this.setState({
                    stuck: true,
                })

                return
            }

            // Otherwise the header is not stuck
            this.setState({
                stuck: false,
            })
        })
    }

    render() {
        const { anime, searchQuery, currentPage, update, openInfoBox, activeSorting, isDetailView } = this.props
        const { stuck } = this.state

        if (!anime.length) {
            return <p className="alert alert-danger mt-3">No matching anime found!</p>
        }

        return (
            <div className={`table mt-3 ${!isDetailView ? 'table-reduced' : ''}`}>
                <div className={`table-row table-header ${stuck ? 'table-header-stuck' : ''}`} title="Hold shift to sort by multiple columns">
                    <TableHeaders update={update} activeSorting={activeSorting} isDetailView={isDetailView} />
                </div>
                {anime.slice((currentPage - 1) * Data.defaults.animePerPage, currentPage * Data.defaults.animePerPage).map(anime =>
                    <TableRow anime={anime} searchQuery={searchQuery} openInfoBox={openInfoBox} isDetailView={isDetailView} key={anime.hash} />
                )}
            </div>
        )
    }
}

class TableHeaders extends PureComponent {
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
        const { isDetailView } = this.props

        const columns = isDetailView ? Object.entries(Data.columns) : Object.entries(Data.columns).filter(([, settings]) => !settings.detailViewOnly)

        return columns.map(([column, settings]) =>
            <div
                className={`table-column ${this.headerClass(column)}`}
                style={{ flexBasis: settings.size }}
                onClick={event => this.sortColumn(column, settings.defaultSorting, event.shiftKey)}
                key={column}
            >
                {settings.text}
            </div>
        )
    }
}
