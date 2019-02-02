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
        const { anime, searchQuery, openInfoBox } = this.props

        return (
            <tr onMouseDown={event => openInfoBox(anime.id, event)} key={anime.hash}>
                <TitleColumn anime={anime} searchQuery={searchQuery} />
                <DataColumns anime={anime} />
            </tr>
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
            <td className="text-left text-nowrap pl-0 d-flex align-items-center">
                <img width="37" height="50" src={anime.img} alt={anime.title} />
                <span className="link text-truncate">
                    {searchQuery.length ? <span dangerouslySetInnerHTML={this.highlightSearchQuery()} /> : anime.title}
                </span>
                <span className="text-secondary ml-2">
                    {Data.filters.type.descriptions[anime.actualType]}
                </span>
            </td>
        )
    }
}

// Misc cells with other data
class DataColumns extends PureComponent {
    render() {
        const { anime } = this.props

        return (
            <Fragment>
                <td>
                    <Badge animeId={anime.id} />
                </td>

                <td>
                    {anime.rating || <Fragment>&ndash;</Fragment>}
                </td>

                <td>
                    {anime.rewatchCount ? `${anime.rewatchCount} ${anime.rewatchCount > 1 ? 'times' : 'time'}` : <Fragment>&ndash;</Fragment>}
                </td>

                <td>
                    {anime.subs || <Fragment>&ndash;</Fragment>}
                </td>

                <td className={`text-${Data.filters.resolution.colorCodes[anime.resolution]}`}>
                    {anime.resolution ? Data.filters.resolution.descriptions[anime.resolution] : <Fragment>&ndash;</Fragment>}
                </td>

                <td className={`text-${Data.filters.source.colorCodes[anime.source]}`}>
                    {anime.source || <Fragment>&ndash;</Fragment>}
                </td>

                <td className={`text-${Data.filters.videoCodec.colorCodes[anime.videoCodec]}`}>
                    {anime.videoCodec || <Fragment>&ndash;</Fragment>}
                </td>

                <td className={`text-${Data.filters.audioCodec.colorCodes[anime.audioCodec]}`}>
                    {anime.audioCodec || <Fragment>&ndash;</Fragment>}
                </td>

                <SizeColumns totalSize={anime.size} episodeSize={anime.episodeSize} />
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
            return (
                <td className="py-0" colSpan="2">
                    <SizeBar size={totalSize} storageSizeLimits={Data.storageSizeLimits.total} />
                </td>
            )
        }

        return (
            <Fragment>
                <td className="py-0">
                    <SizeBar size={episodeSize} storageSizeLimits={Data.storageSizeLimits.episode} />
                </td>
                <td className="py-0">
                    <SizeBar size={totalSize} storageSizeLimits={Data.storageSizeLimits.total} />
                </td>
            </Fragment>
        )
    }
}

// Storage text and progress bar based on given size
class SizeBar extends PureComponent {
    render() {
        const { totalSize, storageSizeLimits } = this.props

        const width = ((totalSize - storageSizeLimits.min) / storageSizeLimits.max) * 100
        const color = totalSize ? ((totalSize > storageSizeLimits.large ? 'danger' : (totalSize > storageSizeLimits.medium ? 'warning' : 'success'))) : 0

        return (
            <Fragment>
                {totalSize ? FileSize(totalSize, {round: totalSize < 1e9 ? 0 : 2}) : <Fragment>&ndash;</Fragment>}
                {totalSize &&
                    <div className="progress bg-secondary">
                        <div className={`progress-bar bg-${color}`} style={{ width: `${width}px` }} />
                    </div>
                }
            </Fragment>
        )
    }
}