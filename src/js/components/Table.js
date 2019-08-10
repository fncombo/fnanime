// React
import React, { memo, useContext, useReducer } from 'react'

// Libraries
import FileSize from 'filesize'
import reactStringReplace from 'react-string-replace'
import { useInView } from 'react-intersection-observer'

// Style
import '../../css/Table.css'

// Data
import { GlobalState, TableState, ACTIONS } from '../data/GlobalState'
import { Defaults } from '../data/Data'
import { Columns, SortingOrders, StorageSizeLimits } from '../data/Table'
import { Filters } from '../data/Filters'

// Helpers
import { getAnimeLink } from '../helpers/Generic'
import { formatOrdinal, getColumnTextColor } from '../helpers/Table'

// Components
import Badge from './Badge'
import Pagination from './Pagination'
import ModalContainer from './Modal'

// Default table state
const initialTablePageState = {
    page: 1,
}

/**
 * Table state reducer.
 */
function tablePageReducer(state, action) {
    switch (action.type) {
    case ACTIONS.NEXT_PAGE:
        return { page: state.page + 1 }

    case ACTIONS.PREV_PAGE:
        return { page: state.page - 1 }

    case ACTIONS.SET_PAGE:
        return { page: action.page }

    default:
        return state
    }
}

/**
 * Table showing current anime with pagination.
 */
function Table() {
    const { state: { anime } } = useContext(GlobalState)
    const [ state, dispatch ] = useReducer(tablePageReducer, initialTablePageState)

    if (!anime.length) {
        return <p className="alert alert-danger mt-3">No matching anime found!</p>
    }

    // Calculate the last possible page number
    const lastPage = Math.ceil(anime.length / Defaults.perPage)

    return (
        <TableState.Provider value={{ state, dispatch, lastPage }}>
            <div className="table mt-3">
                <Header />
                {anime.slice((state.page - 1) * Defaults.perPage, state.page * Defaults.perPage).map(anime =>
                    <Row key={anime.id} {...anime} />
                )}
            </div>
            <Pagination />
        </TableState.Provider>
    )
}

/**
 * Table header which becomes stuck to the top and gains additional styling.
 */
const Header = memo(() => {
    const [ ref, inView, entry ] = useInView()

    // Check whether the table header is stuck to add additional styling
    const isStuck = entry ? (inView ? '' : 'stuck') : ''

    return (
        <>
            <div className="table-sentinel" ref={ref} />
            <div className={`table-header ${isStuck}`}>
                {Object.keys(Columns).map(columnName =>
                    <HeaderColumn columnName={columnName} key={columnName} />
                )}
            </div>
        </>
    )
})

/**
 * Column for the header of the table which can be clicked to sort the table.
 */
const HeaderColumn = memo(({ columnName }) => {
    const { state: { activeSorting }, dispatch } = useContext(GlobalState)

    const activeSortingKeys = Object.keys(activeSorting)

    // Callback to update sorting when clicking on a column
    const changeSorting = ({ shiftKey }) => {
        // Ammending current sorting (holding shift) or sorting only the currently sorted column modifies existing
        // sorting settings, otherwise create new settings
        const newSorting = (shiftKey || (
            activeSortingKeys.length === 1 && activeSorting.hasOwnProperty(columnName)
        )) ? { ...activeSorting } : {}

        // Check if this column is already being sorted, in which case reverse it,
        // otherwise use the default sorting for it
        if (newSorting.hasOwnProperty(columnName)) {
            newSorting[columnName] = (newSorting[columnName] === SortingOrders.asc) ? SortingOrders.desc : SortingOrders.asc

        // Add new sorting for this column because it isn't being sorted yet
        } else {
            newSorting[columnName] = Columns[columnName].defaultSorting
        }

        dispatch({
            type: ACTIONS.CHANGE_SORTING,
            columnName,
            newSorting,
        })
    }

    const sortingClass = activeSorting.hasOwnProperty(columnName) ? `sort-${activeSorting[columnName]}` : ''

    let index = ''
    let title = ''

    // If this column is being sorted, say so and the order of the sort
    if (activeSorting.hasOwnProperty(columnName)) {
        // If there are multiple sorting columns, get the index this one was activated at
        if (activeSortingKeys.length > 1) {
            index = activeSortingKeys.indexOf(columnName) + 1
            title = `Sorting ${index}${formatOrdinal(index)} by this column in ${activeSorting[columnName]}ending order.\n\n`
        } else {
            title = `Sorting by this column in ${activeSorting[columnName]}ending order.\n\n`
        }
    }

    return (
        <div
            className={`table-column ${sortingClass}`}
            style={{ flexBasis: Columns[columnName].size }}
            onClick={changeSorting}
            data-index={index}
            title={`${title}Hold shift to sort by multiple columns.`}
        >
            {Columns[columnName].text}
        </div>
    )
})

/**
 * Table row of data for a single anime.
 */
function Row(anime) {
    return (
        <ModalContainer
            anime={anime}
            className="table-row"
            href={getAnimeLink(anime.id, anime.url)}
            target="_blank"
            rel="noopener noreferrer"
        >
            <TitleColumn {...anime} />
            <Column columnName="status">
                <Badge {...anime} />
            </Column>
            <Column columnName="rating">
                {anime.rating}
            </Column>
            <Column columnName="rewatchCount">
                {anime.rewatchCount}
            </Column>
            <Column columnName="subs" value={anime.subs}>
                <span className="text-truncate">{anime.subs}</span>
            </Column>
            <Column columnName="resolution" value={anime.resolution}>
                {anime.resolution}p
            </Column>
            <Column columnName="source">
                {anime.source}
            </Column>
            <Column columnName="videoCodec">
                {anime.videoCodec}
            </Column>
            <Column columnName="audioCodec">
                {anime.audioCodec}
            </Column>
            <Column columnName="fileQuality">
                {anime.fileQuality}
            </Column>
            <SizeColumns episodeSize={anime.episodeSize} size={anime.size} />
        </ModalContainer>
    )
}

/**
 * Title column for an anime which contains the image, title, and anime type. If a search query is present,
 * it gets highlighted using the anime status color.
 */
function TitleColumn({ title, img, status, actualType, highlight }) {
    // If there was a search and highlight indicies have been provided, highlight matches results using them
    const highlightTitle = () => {
        return highlight.reduce((newTitle, indices) => {
            return reactStringReplace(newTitle, title.slice(indices[0], indices[1] + 1), (match, i) =>
                <strong key={match + i}>{match}</strong>
            )
        }, title)
    }

    return (
        <div
            className={`table-column pr-2 color-${Filters.status.colorCodes[status]}`}
            style={{ flexBasis: Columns.title.size }}
        >
            <img width="37" height="50" src={img} alt={title} />
            <span className="ml-2 text-truncate" title={title}>
                {highlight ? highlightTitle() : title}
            </span>
            <span className="text-gray ml-2">
                {Filters.type.descriptions[actualType]}
            </span>
        </div>
    )
}

/**
 * Generic column with anime data, optionally color coded.
 */
function Column({ value, columnName, children }) {
    const textColor = getColumnTextColor(columnName, value || children) || 'black'

    // Fallback to a dash if there are no children or value
    return (
        <div className={`table-column text-${textColor}`} style={{ flexBasis: Columns[columnName].size }}>
            {(value !== undefined ? value : children) ? (children || value) : <>&mdash;</>}
        </div>
    )
}

/**
 * Either two columns showing the size per episode and total size of the anime, or one column spanning two columns
 * if both sizes are the same.
 */
function SizeColumns({ episodeSize, size }) {
    // If the size is the same, only create one column
    if (size === episodeSize) {
        // Add the widths of both columns
        const width = parseInt(Columns.episodeSize.size, 10) + parseInt(Columns.size.size, 10)

        return (
            <div className="table-column table-progress" style={{ flexBasis: `${width}%` }}>
                <SizeBar type="total" size={size} />
            </div>
        )
    }

    return (
        <>
            <div className="table-column table-progress" style={{ flexBasis: Columns.episodeSize.size }}>
                <SizeBar type="episode" size={episodeSize} />
            </div>
            <div className="table-column table-progress" style={{ flexBasis: Columns.size.size }}>
                <SizeBar type="total" size={size} />
            </div>
        </>
    )
}

/**
 * Size bar and formatted size text.
 */
function SizeBar({ type, size }) {
    if (!size) {
        return <>&mdash;</>
    }

    const limits = StorageSizeLimits[type]

    // Calculate the width of the bar relative to the min and max
    const width = ((size - limits.min) / limits.max) * 100

    // Work out the color of the bar based on size breakpoints
    const color = size > limits.large ? 'danger' : (size > limits.medium ? 'warning' : 'success')

    return (
        <>
            {FileSize(size, {round: size < 1e9 ? 0 : 2})}
            <div className="progress bg-secondary">
                <div className={`progress-bar bg-${color}`} style={{ width: `${width}px` }} />
            </div>
        </>
    )
}

// Exports
export default Table