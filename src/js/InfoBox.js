// Libraries
import FileSize from 'filesize'

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
            props: {},
            apiData: {},
        }
    }

    // Add/remove class from body when opening, closing, or updating
    componentWillUpdate(nextProps, nextState) {
        const currentId = nextState.props.selectedAnimeId
        const nextId = nextProps.selectedAnimeId

        // Anime ID changed
        if (currentId && nextId && currentId !== nextId) {
            document.body.classList.add('modal-switching')

            // Wait for CSS animation to finish
            setTimeout(() => {
                document.body.classList.remove('modal-switching')
                this.setState({
                    loaded: false,
                    transitioning: false,
                    props: nextProps,
                }, this.getApiData)
            }, 150)

        // Just opened and new ID set
        } else if (!currentId && nextId && currentId !== nextId) {
            this.setState({
                loaded: false,
                props: nextProps,
            }, this.getApiData)

        // Close and ID removed
        } else if (currentId && !nextId && currentId !== nextId) {
            // Wait for CSS animation to finish
            setTimeout(() => {
                this.setState({
                    loaded: false,
                    props: {},
                })
            }, 150)
        }
    }

    // Get API data from Jikan about this anime, such as synopsis
    getApiData() {
        fetch(`https://api.jikan.moe/anime/${this.state.props.selectedAnimeId}`)
        .then(res => res.json())
        .then(data => {
            if (data.hasOwnProperty('error')) {
                console.error('API responded with an error:', data.error)
                return
            }

            this.setState({
                loaded: true,
                apiData: data,
            })
        }, error => {
            console.error('Error while fetching API:', error)
        })
    }

    render() {
        const { loaded, props, apiData } = this.state
        const { selectedAnimeId, openInfoBox, closeInfoBox } = props

        // The anime we're talkin' about
        const anime = data.anime[selectedAnimeId]

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

        // Synopsis text
        const synopsis = loaded ? apiData.synopsis.replace(/&#(\d+);/g, (match, p1) => String.fromCharCode(p1)) : false
        let synopsisSize = 0

        // Calculate the size of the paragraph to smoothly animate the height when it loads in
        if (synopsis) {
            const synopsisTextEl = document.createTextNode(synopsis)
            const synopsisEl = document.createElement('p')
            synopsisEl.style.width = '867px'
            synopsisEl.appendChild(synopsisTextEl)
            document.body.appendChild(synopsisEl)
            synopsisSize = synopsisEl.clientHeight
            document.body.removeChild(synopsisEl)
        }

        return (
            <Fragment>
                <div className="modal-header">
                    <h5 className={`modal-title`}>
                        <a title="Open on MyAnimeList" href={`https://myanimelist.net/anime/${anime.id}/${anime.url}`} target="_blank">
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
                <div className={`modal-body row`}>
                    <div className="col-3">
                        <img className="image rounded" width="250" src={anime.imageUrl} alt={anime.title} />
                        <div className="rating-stars text-center">
                            <span className="active">
                                {new Array(anime.rating).fill(0).map(() => '★')}
                            </span>
                            <span className="inactive">
                                {new Array(10 - anime.rating).fill(0).map(() => '★')}
                            </span>
                            <h5>{anime.rating ? data.lookup.rating[anime.rating] : 'Not Rated'}</h5>
                            {loaded ?
                            <p>Average MAL rating: {apiData.score ? apiData.score : 'N/A'}</p> :
                            <span className="loading-text mt-3" />}
                        </div>
                        <hr />
                        <p className="text-center mb-0">{data.lookup.actualType[anime.actualType]} - {anime.episodes} {anime.episodes > 1 ? 'episodes' : 'episode'}</p>
                        {loaded ?
                        <p className="text-center mb-0">Aired {apiData.aired_string}</p> :
                        <span className="loading-text  mb-0" />}
                    </div>
                    <div className="col-9">
                        <h5>Statistics</h5>
                        <div className="row">
                            <div className="col-6">
                                <ul>
                                    <li><strong>Total Storage Size:</strong> {anime.downloaded ? FileSize(anime.size) : 'Not Downloaded'}</li>
                                    {anime.episodes > 1 &&
                                    <li><strong>Average per Episode:</strong> {anime.downloaded ? FileSize(anime.size / anime.episodes) : 'Not Downloaded'}</li>}
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
                        <div className={`loading-paragraph ${loaded ? 'loaded' : ''}`} style={{height: loaded ? `${synopsisSize}px` : false}}>
                            <span /><span /><span />
                            <span /><span /><span />
                            <span /><span /><span />
                            {loaded && <p>{synopsis}</p>}
                        </div>
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
        const { selectedAnimeId, openInfoBox } = this.props

        // The anime we're talkin' about
        const anime = data.anime[selectedAnimeId]

        if (!anime.related) {
            return <p>No related anime</p>
        }

        return Object.entries(anime.related).map(([type, anime]) =>
            <Fragment key={type}>
                <h6>{type}</h6>
                <ul className="related">
                    {anime.map(anime =>
                        <li className="container" key={anime.id}>
                            <a title="Open on MyAnimeList" href={`https://myanimelist.net/anime/${anime.id}/${anime.url}`} target="_blank">
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