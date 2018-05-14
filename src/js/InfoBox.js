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
    constructor(props) {
        super(props)

        this.state = {
            loaded: false,
            apiData: {},
        }
    }

    // Add/remove class from body when opening/closing
    componentDidUpdate(prevProps, prevState) {
        const { selectedAnimeId } = this.props

        // Don't do anythiung if it's still the same anime
        if (prevProps.selectedAnimeId === selectedAnimeId) {
            return
        }

        // Reset state
        this.setState({
            loaded: false,
        })

        // Get API data that was too big for the local JSON data
        if (selectedAnimeId) {
            fetch(`https://api.jikan.moe/anime/${selectedAnimeId}`)
            .then(res => res.json())
            .then(data => this.setState({
                loaded: true,
                apiData: data,
            }), error => console.error(error))
        }
    }

    render() {
        const { selectedAnimeId, openInfoBox, closeInfoBox } = this.props;

        // The anime we're talkin' about
        const anime = data.anime[selectedAnimeId];

        if (!anime) {
            return null
        }

        // Nicely display how many episodes watched, or how many total times watched if more than 1 or only 1 episode
        let watchedString
        if (anime.rewatchCount || (anime.watchedEpisodes && anime.episodes === 1)) {
            watchedString = `${anime.rewatchCount + 1} time${anime.rewatchCount + 1 > 1 ? 's' : ''}`
        } else if (anime.watchedEpisodes && anime.episodes > 1) {
            watchedString = `${anime.watchedEpisodes}/${anime.episodes} episodes`
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
                        <img className="image rounded" width="250" src={anime.imageUrl} alt={anime.title} />
                        <div className="rating-stars text-center">
                            <span className="active">
                                {new Array(anime.rating).fill(0).map(() => '★')}
                            </span>
                            <span className="inactive">
                                {new Array(10 - anime.rating).fill(0).map(() => '★')}
                            </span>
                            <h5>{anime.rating ? `${anime.rating} - ${data.lookup.rating[anime.rating]}` : 'Not Rated'}</h5>
                            <p>Average MAL rating: {anime.averageRating ? anime.averageRating : 'N/A'}</p>
                        </div>
                        <hr />
                        <p className="text-center mb-0">{data.lookup.actualType[anime.actualType]} - {anime.episodes} {anime.episodes > 1 ? 'episodes' : 'episode'}</p>
                        <p className="text-center">Aired {this.state.loaded ? this.state.apiData.aired_string : '????'}</p>
                    </div>
                    <div className="col-9">
                        <h5>Statistics</h5>
                        <div className="row">
                            <div className="col-6">
                                <ul>
                                    <li><strong>Total Storage Size:</strong> {anime.downloaded ? filesize(anime.size) : 'Not Downloaded'}</li>
                                    {anime.episodes > 1 &&
                                    <li><strong>Average per Episode:</strong> {anime.downloaded ? filesize(anime.size / anime.episodes) : 'Not Downloaded'}</li>}
                                    {!!watchedString &&
                                    <li><strong>Watched:</strong> {watchedString}</li>}
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
                        <p>{this.state.loaded ? this.state.apiData.synopsis.replace(/[[(].+[\])]/, '').replace(/&#(\d+);/g, (match, p1) => String.fromCharCode(p1)) : '?????'}</p>
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
                            <a title="Open on MyAnimeList" href={anime.url} target="_blank">
                                {anime.title.replace(/&#(\d+);/g, (match, p1) => String.fromCharCode(p1))}
                            </a>
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