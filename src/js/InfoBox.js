// Libraries
import filesize from 'filesize'

// React
import React, { PureComponent, Fragment } from 'react'

// Style
import '../css/InfoBox.css'

// Data
import data from './data.json'

// Helpers
import prettyTime from './PrettyTime'

// Information box about a specific selected anime
export default class InfoBox extends PureComponent {
    // Add/remove class from body when opening/closing
    componentDidUpdate() {
        const { selectedAnimeId, infoBoxVisible } = this.props;
        document.body.classList[infoBoxVisible && selectedAnimeId ? 'add' : 'remove']('modal-open')
    }

    render() {
        const { selectedAnimeId, openInfoBox, closeInfoBox } = this.props;

        // The anime we're talkin' about
        const anime = data.anime[selectedAnimeId];

        if (!anime) {
            return null
        }

        return (
            <Fragment>
                <div className="modal-header">
                    <h5 className="modal-title">
                        <a title="Open on MyAnimeList" href={anime.url} target="_blank">
                            {anime.title}
                        </a>
                        <span className={`status-pill status-pill-${data.lookup.statusColor[anime.status]}`}>
                            {data.lookup.status[anime.status]}
                        </span>
                    </h5>
                    <button className="close" onClick={closeInfoBox}>
                        <span>&times;</span>
                    </button>
                </div>
                <div className="modal-body row">
                    <div className="col-3">
                        <div className="image rounded" style={{backgroundImage: `url(${anime.imageUrl})`}}></div>
                        {!!anime.rating &&
                        <Fragment>
                            <div className="rating-stars text-center">
                                <span className="active">
                                    {new Array(anime.rating).fill(0).map(() => '★')}
                                </span>
                                <span className="inactive">
                                    {new Array(10 - anime.rating).fill(0).map(() => '★')}
                                </span>
                                <h5>{anime.rating} - {data.lookup.rating[anime.rating]}</h5>
                                <p>Average MAL rating: {anime.averageRating}</p>
                            </div>
                            <hr />
                        </Fragment>}
                        <p className="text-center mb-0">{data.lookup.actualType[anime.actualType]} - {anime.episodes} {anime.episodes > 1 ? 'episodes' : 'episode'}</p>
                        <p className="text-center">Aired {anime.aired}</p>
                    </div>
                    <div className="col-9">
                        <h5>Statistics</h5>
                        <div className="row">
                            <div className="col-6">
                                <ul>
                                    <li><strong>Total Storage Size:</strong> {anime.downloaded ? filesize(anime.size) : 'Not Downloaded'}</li>
                                    {anime.episodes > 1 &&
                                    <li><strong>Average per Episode:</strong> {anime.downloaded ? filesize(anime.size / anime.episodes) : 'Not Downloaded'}</li>}
                                    {!!anime.rewatchCount &&
                                    <li><strong>Rewatched:</strong> {anime.rewatchCount} {anime.rewatchCount === 1 ? 'time' : 'times'}</li>}
                                </ul>
                            </div>
                            <div className="col-6">
                                <ul>
                                    <li>
                                        <strong>Duration: </strong>
                                        {anime.duration ? prettyTime(anime.duration, 'm') : 'Unknown'}
                                        {!!anime.duration && anime.episodes > 1 && ' per episode'}
                                    </li>
                                    {anime.episodes > 1 &&
                                    <li>
                                        <strong>Total Duration: </strong>
                                        {anime.duration ? prettyTime(anime.duration * anime.episodes, 'm') : 'Unknown'}
                                    </li>}
                                    {!!anime.watchedEpisodes &&
                                    <li>
                                        <strong>Total Watch Time: </strong>
                                        {prettyTime(anime.duration * anime.watchedEpisodes * (anime.rewatchCount + 1), 'm')}
                                    </li>}
                                </ul>
                            </div>
                        </div>
                        <hr />
                        <h5>Synopsis</h5>
                        <p>{anime.synopsis.replace(/[[(].+[\])]/, '').replace(/&#(\d+);/g, (match, p1) => String.fromCharCode(p1))}</p>
                        <hr />
                        <h5>Related Anime</h5>
                        <RelatedAnimeList selectedAnimeId={selectedAnimeId} openInfoBox={openInfoBox} />
                    </div>
                </div>
            </Fragment>
        )
    }
}

// Make a list of the related anime
class RelatedAnimeList extends PureComponent {
    render() {
        const { selectedAnimeId, openInfoBox } = this.props;

        // The anime we're talkin' about
        const anime = data.anime[selectedAnimeId];

        if (!anime.related) {
            return <p>No related anime</p>
        }

        return Object.entries(anime.related).map(([type, anime]) =>
            <Fragment key={type}>
                <h6>{type}</h6>
                <ul className="related">
                    {anime.map(anime =>
                        <li className="container" key={anime.id}>
                            <a title="Open on MyAnimeList" href={anime.url} target="_blank">{anime.title}</a>
                            {data.anime.hasOwnProperty(anime.id) &&
                            <span
                                title="View"
                                className={`status-pill status-pill-link status-pill-${data.lookup.statusColor[data.anime[anime.id].status]}`}
                                onClick={() => openInfoBox(anime.id)}
                            >
                                {data.lookup.status[data.anime[anime.id].status]}
                                {!!data.anime[anime.id].rating && ` - Rated ${data.anime[anime.id].rating}`}
                            </span>}
                        </li>
                    )}
                </ul>
            </Fragment>
        )
    }
}