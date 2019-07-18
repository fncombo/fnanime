// Libraries
import FileSize from 'filesize'
import FuzzySort from 'fuzzysort'

// React
import React, { PureComponent, Fragment } from 'react'

// Components
import Data from './Data'
import Badge from './Badge'

// Single row for an anime
export default class TableRow extends PureComponent {
    render() {
        const { anime, searchQuery, openInfoBox, isDetailView } = this.props

        return (
            <div className="table-row" onMouseDown={event => openInfoBox(anime.id, event)} key={anime.hash}>
                <TitleColumn anime={anime} searchQuery={searchQuery} />
                <DataColumns anime={anime} isDetailView={isDetailView} />
            </div>
        )
    }
}

// The image, title, and type of the anime in one cell
class TitleColumn extends PureComponent {
    // Highlighting search query in anime's title
    highlightSearchQuery() {
        const { anime, searchQuery } = this.props

        // Search for the match in the title
        const result = FuzzySort.single(searchQuery, anime.title)

        // Inner HTML must be set this way to count <strong> tags as HTML in JSX
        return {
            __html: FuzzySort.highlight(result, '<strong>', '</strong>'),
        }
    }

    render() {
        const { anime, searchQuery } = this.props

        return (
            <div
                className={`table-column text-left text-nowrap pr-3 justify-content-start color-${Data.filters.status.colorCodes[anime.status]}`}
                style={{ flexBasis: Data.getColumnSize(0) }}
            >
                <img width="37" height="50" src={anime.img} alt={anime.title} />
                <span className="ml-3 text-truncate">
                    {searchQuery.length ? <span dangerouslySetInnerHTML={this.highlightSearchQuery()} /> : anime.title}
                </span>
                <span className="text-gray ml-3">
                    {Data.filters.type.descriptions[anime.actualType]}
                </span>
            </div>
        )
    }
}

// Misc cells with other data
class DataColumns extends PureComponent {
    render() {
        const { anime, isDetailView } = this.props

        return (
            <Fragment>
                {Data.getColumnVisibility(1, isDetailView) &&
                    <div className="table-column" style={{ flexBasis: Data.getColumnSize(1) }}>
                        <Badge animeId={anime.id} />
                    </div>
                }

                {Data.getColumnVisibility(2, isDetailView) &&
                    <div className="table-column" style={{ flexBasis: Data.getColumnSize(2) }}>
                        {anime.rating || <Fragment>&ndash;</Fragment>}
                    </div>
                }

                {Data.getColumnVisibility(3, isDetailView) &&
                    <div className="table-column" style={{ flexBasis: Data.getColumnSize(3) }}>
                        {anime.rewatchCount ? `${anime.rewatchCount} ${anime.rewatchCount > 1 ? 'times' : 'time'}` : <Fragment>&ndash;</Fragment>}
                    </div>
                }

                {Data.getColumnVisibility(4, isDetailView) &&
                    <div className="table-column" style={{ flexBasis: Data.getColumnSize(4) }}>
                        {anime.subs || <Fragment>&ndash;</Fragment>}
                    </div>
                }

                {Data.getColumnVisibility(5, isDetailView) &&
                    <div className={`table-column text-${Data.filters.resolution.colorCodes[anime.resolution]}`} style={{ flexBasis: Data.getColumnSize(5) }}>
                        {anime.resolution ? Data.filters.resolution.descriptions[anime.resolution] : <Fragment>&ndash;</Fragment>}
                    </div>
                }

                {Data.getColumnVisibility(6, isDetailView) &&
                    <div className={`table-column text-${Data.filters.source.colorCodes[anime.source]}`} style={{ flexBasis: Data.getColumnSize(6) }}>
                        {anime.source || <Fragment>&ndash;</Fragment>}
                    </div>
                }

                {Data.getColumnVisibility(7, isDetailView) &&
                    <div className={`table-column text-${Data.filters.videoCodec.colorCodes[anime.videoCodec]}`} style={{ flexBasis: Data.getColumnSize(7) }}>
                        {anime.videoCodec || <Fragment>&ndash;</Fragment>}
                    </div>
                }

                {Data.getColumnVisibility(8, isDetailView) &&
                    <div className={`table-column text-${Data.filters.audioCodec.colorCodes[anime.audioCodec]}`} style={{ flexBasis: Data.getColumnSize(8) }}>
                        {anime.audioCodec || <Fragment>&ndash;</Fragment>}
                    </div>
                }

                {Data.getColumnVisibility(9, isDetailView) &&
                    <SizeColumns totalSize={anime.size} episodeSize={anime.episodeSize} />
                }
            </Fragment>
        )
    }
}

// Cell with the storage sizes and relative progress bars
class SizeColumns extends PureComponent {
    render() {
        const { totalSize, episodeSize } = this.props

        // Same size if only 1 episode, merge into a single cell
        if (totalSize === episodeSize) {
            const flexBasis = parseInt(Data.getColumnSize(9), 10) + parseInt(Data.getColumnSize(10), 10) + '%'

            return (
                <div className="table-column table-progress" style={{ flexBasis }}>
                    <SizeBar size={totalSize} storageSizeLimits={Data.storageSizeLimits.total} />
                </div>
            )
        }

        return (
            <Fragment>
                <div className="table-column table-progress" style={{ flexBasis: Data.getColumnSize(9) }}>
                    <SizeBar size={episodeSize} storageSizeLimits={Data.storageSizeLimits.episode} />
                </div>
                <div className="table-column table-progress" style={{ flexBasis: Data.getColumnSize(10) }}>
                    <SizeBar size={totalSize} storageSizeLimits={Data.storageSizeLimits.total} />
                </div>
            </Fragment>
        )
    }
}

// Storage text and progress bar based on given size
class SizeBar extends PureComponent {
    render() {
        const { size, storageSizeLimits } = this.props

        const width = ((size - storageSizeLimits.min) / storageSizeLimits.max) * 100
        const color = size ? ((size > storageSizeLimits.large ? 'danger' : (size > storageSizeLimits.medium ? 'warning' : 'success'))) : 0

        return (
            <Fragment>
                {size ? FileSize(size, {round: size < 1e9 ? 0 : 2}) : <Fragment>&ndash;</Fragment>}
                {!!size &&
                    <div className="progress bg-secondary">
                        <div className={`progress-bar bg-${color}`} style={{ width: `${width}px` }} />
                    </div>
                }
            </Fragment>
        )
    }
}
