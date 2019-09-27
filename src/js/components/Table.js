// React
import React, { memo, useContext, useReducer } from 'react'

// Libraries
import has from 'has'
import classNames from 'classnames'
import { useInView } from 'react-intersection-observer'

// Style
import 'scss/Table.scss'

// Data
import { GlobalState, TableState, ACTIONS } from 'js/data/GlobalState'
import { DEFAULTS } from 'js/data/Data'
import { TABLE_COLUMNS, SORTING_ORDERS, SORTING_ICONS } from 'js/data/Table'
import { FILTERS } from 'js/data/Filters'

// Helpers
import { formatOrdinal, getColumnTextColor, getSizeBarWidth, getSizeBarColor, highlightTitle } from 'js/helpers/Table'
import fileSize from 'js/helpers/FileSize'
import Icon from 'js/helpers/Icon'

// Components
import Badge from 'js/components/Badge'
import Pagination from 'js/components/Pagination'
import ModalContainer from 'js/components/Modal'

// Default table state
const INITIAL_TABLE_STATE = {
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
    const { state: { anime: allAnime } } = useContext(GlobalState)
    const [ state, dispatch ] = useReducer(tablePageReducer, INITIAL_TABLE_STATE)

    if (!allAnime.length) {
        return (
            <div className="container">
                <p className="table-empty">
                    <Icon icon="exclamation-circle" />No matching anime found
                </p>
            </div>
        )
    }

    // Calculate the last possible page number
    const lastPage = Math.ceil(allAnime.length / DEFAULTS.perPage)

    return (
        <TableState.Provider value={{ state, dispatch, lastPage }}>
            <div className="container">
                <div className="table">
                    <Header />
                    {allAnime.slice((state.page - 1) * DEFAULTS.perPage, state.page * DEFAULTS.perPage).map(anime =>
                        <Row key={anime.id} {...anime} />
                    )}
                    <Pagination />
                </div>
            </div>
        </TableState.Provider>
    )
}

/**
 * Table header which becomes stuck to the top and gains additional styling.
 */
const Header = memo(() => {
    const [ ref, inView, entry ] = useInView()

    // Check whether the table header is stuck to add additional styling
    const classes = classNames('table-header', {
        'is-stuck': !inView && entry,
    })

    return (
        <>
            <div className="table-sentinel" ref={ref} />
            <div className={classes}>
                {Object.keys(TABLE_COLUMNS).map(columnName =>
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
        // Amending current sorting (holding shift) or sorting only the currently sorted column modifies existing
        // sorting settings, otherwise create new settings
        const newSorting = shiftKey || (
            activeSortingKeys.length === 1 && has(activeSorting, columnName)
        ) ? { ...activeSorting } : {}

        // Check if this column is already being sorted, in which case reverse it,
        // otherwise use the default sorting for it
        if (has(newSorting, columnName)) {
            newSorting[columnName] = newSorting[columnName] === SORTING_ORDERS.asc
                ? SORTING_ORDERS.desc
                : SORTING_ORDERS.asc

        // Add new sorting for this column because it isn't being sorted yet
        } else {
            newSorting[columnName] = TABLE_COLUMNS[columnName].defaultSorting
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
    if (has(activeSorting, columnName)) {
        // If there are multiple sorting columns, get the index this one was activated at
        if (activeSortingKeys.length > 1) {
            index = activeSortingKeys.indexOf(columnName) + 1

            const ordinal = formatOrdinal(index)

            title = `Sorting ${index}${ordinal} by this column in ${activeSorting[columnName]}ending order.\n\n`
        } else {
            title = `Sorting by this column in ${activeSorting[columnName]}ending order.\n\n`
        }
    }

    title = `${title}Hold shift to sort by multiple columns.`

    const flexBasis = TABLE_COLUMNS[columnName].size

    return (
        <div className="table-column" style={{ flexBasis }} onClick={changeSorting} data-index={index} title={title}>
            {has(activeSorting, columnName) &&
                <Icon icon={SORTING_ICONS[activeSorting[columnName]]} className={`is-${activeSorting[columnName]}`} />
            }
            {TABLE_COLUMNS[columnName].text}
        </div>
    )
})

/**
 * Table row of data for a single anime.
 */
function Row(anime) {
    return (
        <ModalContainer anime={anime} className="table-row" href={anime.url} target="_blank" rel="noopener noreferrer">
            <TitleColumn {...anime} />
            <Column columnName="status">
                <Badge includeAirStatus {...anime} />
            </Column>
            <Column columnName="rating">
                {anime.rating}
            </Column>
            <Column columnName="rewatchCount">
                {anime.rewatchCount}
            </Column>
            <Column columnName="subs" value={anime.subs}>
                <span className="has-text-overflow">
                    {anime.subs.length ? anime.subs.join(', ') : <>&mdash;</>}
                </span>
            </Column>
            <Column columnName="resolution" value={anime.resolution}>
                {FILTERS.resolution.descriptions[anime.resolution]}
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
            <Column columnName="fileQuality" value={anime.fileQuality}>
                {anime.fileQuality ? anime.fileQuality.toLocaleString() : null}
            </Column>
            <SizeColumns episodeSize={anime.episodeSize} size={anime.size} />
        </ModalContainer>
    )
}

/**
 * Title column for an anime which contains the image, title, and anime type. If a search query is present,
 * it gets highlighted using the anime status color.
 */
function TitleColumn({ title, img, status, type, highlight }) {
    const classes = classNames('table-column', `has-highlight-${FILTERS.status.colorCodes[status]}`)

    return (
        <div className={classes} style={{ flexBasis: TABLE_COLUMNS.title.size }}>
            <img width="37" height="50" src={img} alt={title} loading="lazy" />
            <span className="has-text-overflow" title={title}>
                {highlight ? highlightTitle(title, highlight) : title}
            </span>
            <span className="type">
                {FILTERS.type.descriptions[type]}
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
        <div className={`table-column has-text-${textColor}`} style={{ flexBasis: TABLE_COLUMNS[columnName].size }}>
            {(value === undefined ? children : value) ? children || value : <>&mdash;</>}
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
        const width = parseInt(TABLE_COLUMNS.episodeSize.size, 10) + parseInt(TABLE_COLUMNS.size.size, 10)

        return (
            <div className="table-column has-progress is-double" style={{ flexBasis: `${width}%` }}>
                <SizeBar size={size} type="total" />
            </div>
        )
    }

    return (
        <>
            <div className="table-column has-progress" style={{ flexBasis: TABLE_COLUMNS.episodeSize.size }}>
                <SizeBar size={episodeSize} type="episode" />
            </div>
            <div className="table-column has-progress" style={{ flexBasis: TABLE_COLUMNS.size.size }}>
                <SizeBar size={size} type="total" />
            </div>
        </>
    )
}

/**
 * Size bar and formatted size text.
 */
function SizeBar({ size, type }) {
    if (!size) {
        return <>&mdash;</>
    }

    // Calculate the width of the bar relative to the min and max
    const width = getSizeBarWidth(size, type)
    const color = getSizeBarColor(size, type)

    return (
        <>
            {fileSize(size, { round: size < 1e9 ? 0 : 2 })}
            <progress className={`progress is-${color}`} value={width} max="100" />
        </>
    )
}

// Exports
export default Table
