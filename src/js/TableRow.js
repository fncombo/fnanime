// Libraries
import FuzzySort from 'fuzzysort'
import FileSize from 'filesize'

// React
import React, { PureComponent, Fragment } from 'react'

// Data
import data from './data.json'

// Single table row for an anime, preventing re-rendering of statics columns whenever possible
export default class TableRow extends PureComponent {
    render() {
        const { anime, searchQuery, openInfoBox } = this.props

        return (
            <tr className={!anime.downloaded ? 'not-downloaded' : ''} onClick={() => openInfoBox(anime.id)} key={anime.id}>
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
                    {/* <span className="anime-image" style={{backgroundImage: `url(${anime.imageUrl})`}} /> */}
                    <img width="37" height="50" src={anime.imageUrl} alt={anime.title} />
                    <span className="link">
                        {searchQuery.length ? <span dangerouslySetInnerHTML={this.highlightSearchQuery()} /> : anime.title}
                    </span>
                    <span className="text-secondary ml-1">
                        {data.lookup.type[anime.type]}
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

        return (
            <Fragment>
                <td>
                    <span className={`status-pill status-pill-${data.lookup.statusColor[anime.status]}`}>
                        {data.lookup.status[anime.status]}
                    </span>
                </td>

                <td className="text-left">{anime.subGroup ? anime.subGroup.join(', ') : <Fragment>&mdash;</Fragment>}</td>

                <td className={anime.resolution ? `text-${data.lookup.resolutionColor[anime.resolution]}` : ''}>
                    {anime.resolution ? `${anime.resolution}p` : <Fragment>&mdash;</Fragment>}
                </td>

                <td className={!(!anime.source || anime.source === 'ZMISS') ? `text-${data.lookup.sourceColor[anime.source]}` : ''}>
                    {!(!anime.source || anime.source === 'ZMISS') ? data.lookup.source[anime.source] : <Fragment>&mdash;</Fragment>}
                </td>

                <td>{anime.rating || <Fragment>&mdash;</Fragment>}</td>

                <td>{anime.rewatchCount || <Fragment>&mdash;</Fragment>}</td>

                <td
                    title={!anime.sizeMatches && anime.downloaded ? 'Size does not match with the one specified on MyAnimeList' : ''}
                    className={`${anime.downloaded ? 'size-column' : ''} ${!anime.sizeMatches && anime.downloaded ? 'size-mismatch' : ''}`}>
                    {anime.downloaded ? FileSize(anime.size) : 'Not Downloaded'}
                    {anime.downloaded &&
                        <div className='progress bg-secondary'>
                            <div className={`progress-bar bg-${anime.sizeColor}`} style={{ width: `${anime.sizeWidth}px` }} />
                        </div>}
                </td>
            </Fragment>
        )
    }
}