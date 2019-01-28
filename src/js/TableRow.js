// Libraries
import ClassNames from 'classnames'
import FuzzySort from 'fuzzysort'
import FileSize from 'filesize'

// React
import React, { PureComponent, Fragment } from 'react'

// Components
import Data from './Data'

// Single table row for an anime, preventing re-rendering of statics columns whenever possible
export default class TableRow extends PureComponent {
    render() {
        const { anime, searchQuery, openInfoBox } = this.props

        const rowClasses = ClassNames({
            'not-downloaded': !anime.downloaded,
        })

        return (
            <tr className={rowClasses} onMouseDown={event => openInfoBox(anime.id, event)} key={anime.id}>
                <TitleColumn anime={anime} searchQuery={searchQuery} />
                <DataColumns anime={anime} />
            </tr>
        )
    }
}

// Anime title column, with highlighted search query if any
class TitleColumn extends PureComponent {
    highlightSearchQuery() {
        const { anime, searchQuery } = this.props

        // Search for the match in the title, or local title which doesn't have special characters
        const result = FuzzySort.single(searchQuery, anime.title) || FuzzySort.single(searchQuery, anime.localTitle)

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
                    {/* Using background image causes reflow and significantly impacts CSS rendering performance */}
                    {/* <span className="anime-image" style={{backgroundImage: `url(${anime.img})`}} /> */}
                    <img width="37" height="50" src={anime.img} alt={anime.title} />
                    <span className="link">
                        {searchQuery.length ? <span dangerouslySetInnerHTML={this.highlightSearchQuery()} /> : anime.title}
                    </span>
                    <span className="text-secondary ml-1">
                        {Data.lookup.type[anime.type]}
                    </span>
                </div>
            </td>
        )
    }
}

// Columns with all the other data
class DataColumns extends PureComponent {
    render() {
        const { anime } = this.props

        const sizeWidth = (((anime.size - Data.storageSizeLimits.min) / Data.storageSizeLimits.max) * 100) || 0
        const sizeColor = ((anime.size > (Data.storageSizeLimits.max * 0.75) ? 'danger' : (anime.size > (Data.storageSizeLimits.max * 0.5) ? 'warning' : 'primary'))) || 0

        const sizeClasses = ClassNames({
            'size-column': anime.downloaded,
            'size-mismatch': !anime.sizeMatches && anime.downloaded,
        })

        return (
            <Fragment>
                <td>
                    <span className={`status-pill status-pill-${Data.lookup.statusColor[anime.status]}`}>
                        {Data.lookup.status[anime.status]}
                    </span>
                </td>

                <td className="text-left">{anime.subs ? anime.subs.join(', ') : <Fragment>&mdash;</Fragment>}</td>

                <td className={anime.resolution ? `text-${Data.lookup.resolutionColor[anime.resolution]}` : ''}>
                    {anime.resolution ? `${anime.resolution}p` : <Fragment>&mdash;</Fragment>}
                </td>

                <td className={anime.source ? `text-${Data.lookup.sourceColor[anime.source]}` : ''}>
                    {anime.source ? anime.source : <Fragment>&mdash;</Fragment>}
                </td>

                <td>{anime.rating || <Fragment>&mdash;</Fragment>}</td>

                <td>{anime.rewatchCount || <Fragment>&mdash;</Fragment>}</td>

                <td
                    title={!anime.sizeMatches && anime.downloaded ? 'Size does not match with the one specified on MyAnimeList' : ''}
                    className={sizeClasses}>
                    {anime.downloaded ? FileSize(anime.size) : 'Not Downloaded'}
                    {anime.downloaded &&
                        <div className='progress bg-secondary'>
                            <div className={`progress-bar bg-${sizeColor}`} style={{ width: `${sizeWidth}px` }} />
                        </div>
                    }
                </td>
            </Fragment>
        )
    }
}