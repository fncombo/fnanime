// Libraries
import ClassNames from 'classnames'
import FileSize from 'filesize'
import FuzzySort from 'fuzzysort'

// React
import React, { PureComponent, Fragment } from 'react'

// Components
import Data from './Data'
import StatusPill from './StatusPill'

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
            <td>
                <div>
                    <img width="37" height="50" src={anime.img} alt={anime.title} />
                    <span className="link">
                        {searchQuery.length ? <span dangerouslySetInnerHTML={this.highlightSearchQuery()} /> : anime.title}
                    </span>
                    <span className="text-secondary ml-1">
                        {Data.getAnimeTypeText(anime.id)}
                    </span>
                </div>
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
                    <StatusPill animeId={anime.id} />
                </td>

                <td className="text-left">
                    {anime.subs ? (anime.subs.length === 1 ? anime.subs[0] : anime.subs.join(', ')) : <Fragment>&ndash;</Fragment>}
                </td>

                <td className={`text-${Data.lookup.resolutionColor[anime.resolution]}`}>
                    {anime.resolution ? `${anime.resolution}p` : <Fragment>&ndash;</Fragment>}
                </td>

                <td className={`text-${Data.lookup.sourceColor[anime.source]}`}>
                    {anime.source || <Fragment>&ndash;</Fragment>}
                </td>

                <td>
                    {anime.rating || <Fragment>&ndash;</Fragment>}
                </td>

                <td>
                    {anime.rewatchCount || <Fragment>&ndash;</Fragment>}
                </td>

                <SizeColumn size={anime.size} downloaded={anime.downloaded} sizeMatches={anime.sizeMatches} />
            </Fragment>
        )
    }
}

// Cell with the storage size and relative progress bar
class SizeColumn extends PureComponent {
    render() {
        const { size, downloaded, sizeMatches } = this.props

        // Determine storage bar size, colour, and classes
        const sizeWidth = size ? (((size - Data.storageSizeLimits.min) / Data.storageSizeLimits.max) * 100) : 0
        const sizeColor = size ? ((size > Data.storageSizeLimits.danger ? 'danger' : (size > Data.storageSizeLimits.warning ? 'warning' : 'primary'))) : 0

        const className = ClassNames({
            'size-column': downloaded,
            'size-mismatch': !sizeMatches && downloaded,
        })

        return (
            <td className={className} title={!sizeMatches && downloaded ? 'Size does not match with the one specified on MyAnimeList' : null}>
                {downloaded ? FileSize(size) : <Fragment>&ndash;</Fragment>}
                {downloaded &&
                    <div className='progress bg-secondary'>
                        <div className={`progress-bar bg-${sizeColor}`} style={{ width: `${sizeWidth}px` }} />
                    </div>
                }
            </td>
        )
    }
}