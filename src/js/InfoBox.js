// Libraries
import FileSize from 'filesize'
import getRenderedSize from 'react-rendered-size'

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
            synopsisHeight: 0,
            relatedAnimeListHeight: 0,
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
        fetch(`https://api.jikan.moe/v3/anime/${this.state.props.selectedAnimeId}`).then(response =>
            response.json()
        ).then(data => {
            if (data.hasOwnProperty('error')) {
                console.error('API responded with an error:', data.error)
                // TODO display error to the user
                return
            }

            this.setState({
                loaded: true,
                apiData: data,
                // Get the heights of the loaded synopsis and related anime data to animate smoothly
                synopsisHeight: getRenderedSize(<p>${this.fixSynopsisText(data.synopsis)}</p>, 867).height,
                // +3 extra height to accont for bottom pill button padding
                relatedAnimeListHeight: getRenderedSize(<div>{this.relatedAnimeList(data.related)}</div>, 867).height + 3,
            })
        }, error => {
            console.error('Error while fetching API:', error)
            // TODO display error to the user
        })
    }

    // Replace special characters in synopsis text
    fixSynopsisText(text) {
        return text.replace(/&#(\d+);/g, (match, p1) => String.fromCharCode(p1))
    }

    // Remove non-anime related entries
    removeUnwantedRelatedAnime(data) {
        const newData = {}

        Object.entries(data).forEach(([type, anime]) => {
            const newAnime = anime.filter(anime => anime.type === 'anime')

            if (newAnime.length) {
                newData[type] = anime
            }
        })

        return newData
    }

    // Make a list of the related anime
    relatedAnimeList(relatedData) {
        const { loaded, apiData } = this.state
        const { openInfoBox } = this.props

        // Can't make a list if no data is available while loading, unless specifically passed
        if (!loaded && !relatedData) {
            return null
        }

        const cleanData = this.removeUnwantedRelatedAnime(relatedData ? relatedData : apiData.related)

        if (!Object.entries(cleanData).length) {
            return <p>No related anime</p>
        }

        return Object.entries(cleanData).map(([type, anime]) =>
            <Fragment key={type}>
                <h6>{type}</h6>
                <ul className="related">
                    {anime.map(anime =>
                        <li className="container" key={anime.mal_id}>
                            <a title="Open on MyAnimeList" href={anime.url} target="_blank" rel="noopener noreferrer">
                                {anime.name.replace(/&#(\d+);/g, (match, p1) => String.fromCharCode(p1))}
                            </a>
                            {data.anime.hasOwnProperty(anime.mal_id) &&
                                <span
                                    title="View"
                                    className={`status-pill status-pill-link status-pill-${data.lookup.statusColor[data.anime[anime.mal_id].status]}`}
                                    onClick={() => openInfoBox(anime.mal_id)}
                                >
                                    {data.lookup.status[data.anime[anime.mal_id].status]}
                                    {!!data.anime[anime.mal_id].rating && ` - Rated ${data.anime[anime.mal_id].rating}`}
                                </span>}
                        </li>
                    )}
                </ul>
            </Fragment>
        )
    }

    render() {
        const { loaded, props, apiData, synopsisHeight, relatedAnimeListHeight } = this.state
        const { selectedAnimeId, closeInfoBox } = props

        // The anime we're talkin' about
        const anime = data.anime[selectedAnimeId]

        if (!anime) {
            return null
        }

        // Get the anime duration in minutes
        let duration = parseInt(apiData.duration, 10) || false

        if (/per ep/i.test(apiData.duration)) {
            duration = parseInt(apiData.duration, 10)
        } else if (/hr/i.test(apiData.duration)) {
            const match = apiData.duration.match(/(\d+)\s?hr\.?\s?(\d+)?/i)
            duration = (parseInt(match[1], 10) * 60) + (match[2] ? parseInt(match[2], 10) : 0)
        }

        // Format how to display the total duraction and per episode time
        let durationText = 'Unknown'
        if (duration) {
            durationText = `${prettyTime(duration * anime.episodes, 'm')} ${anime.episodes > 1 ? `(${prettyTime(duration, 'm')} per episode)` : ''}`
        }

        // Format how to display the total time if it can be worked out
        let watchTimeText = 'None'

        // If we don't know the duration of the anime or per episode, then we can't calculate it
        if (!duration) {
            watchTimeText = 'Unknown'

        // Otherwise calculate based on how many episodes have been watched
        } else if (duration && anime.watchedEpisodes) {
            watchTimeText = prettyTime(duration * anime.watchedEpisodes * (anime.rewatchCount + 1))

            // If rewatched anime or it's a movie, say how many total times watched
            if (anime.rewatchCount || (anime.watchedEpisodes && anime.episodes === 1)) {
                watchTimeText += ` (watched ${anime.rewatchCount + 1} time${anime.rewatchCount + 1 > 1 ? 's' : ''})`

            // Otherwsie say how many episodes out of total have watched
            } else if (anime.watchedEpisodes && anime.episodes > 1) {
                watchTimeText += ` (${anime.watchedEpisodes}/${anime.episodes} episodes)`
            }
        }

        return (
            <div className={`modal-content theme-${data.lookup.statusColor[anime.status]}`}>
                <div className="modal-header">
                    <h5 className='modal-title'>
                        <a title="Open on MyAnimeList" href={`https://myanimelist.net/anime/${anime.id}/${anime.url}`} target="_blank" rel="noopener noreferrer">
                            {anime.title}
                        </a>
                    </h5>
                    <button className="close" onClick={closeInfoBox}>
                        <span>&times;</span>
                    </button>
                </div>
                <div className="modal-body">
                    <div className="row">
                        <div className="col-3">
                            <img className="image rounded" width="268.5" src={anime.img} alt={anime.title} />
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
                            <p className="text-center mb-0">
                                {data.lookup.type[anime.hasOwnProperty('typeActual') ? anime.typeActual : anime.type]} {String.fromCharCode(8211)} {anime.episodes} {anime.episodes > 1 ? 'episodes' : 'episode'}
                            </p>
                            {loaded ?
                                <p className="text-center mb-0">Aired {apiData.aired.string}</p> :
                                <span className="loading-text  mb-0" />}
                        </div>
                        <div className="col-9">
                            <h5>Statistics</h5>
                            <div className="row">
                                <div className="col-12">
                                    <ul>
                                        <li>
                                            <strong>Storage Size: </strong>
                                            {anime.downloaded ? FileSize(anime.size) : 'Not Downloaded'}
                                            {anime.downloaded && anime.episodes > 1 && <Fragment> (average {FileSize(anime.size / anime.episodes)} per episode)</Fragment>}
                                        </li>
                                        <li>
                                            <strong>Duration: </strong>
                                            {loaded ? durationText : <span className="loading-text loading-inline col-3" />}
                                        </li>
                                        <li>
                                            <strong>Watch Time: </strong>
                                            {loaded ? watchTimeText : <span className="loading-text loading-inline col-3" />}
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <hr />
                            <h5>Synopsis</h5>
                            <div className={`loading-paragraph ${loaded ? 'loaded' : ''}`} style={{ height: loaded ? `${synopsisHeight}px` : false }}>
                                <span /><span /><span />
                                <span /><span /><span />
                                <span /><span /><span />
                                {loaded && <p>{this.fixSynopsisText(apiData.synopsis)}</p>}
                            </div>
                            <hr />
                            <h5>Related Anime</h5>
                            <div className={`loading-paragraph ${loaded ? 'loaded' : ''}`} style={{ height: loaded ? `${relatedAnimeListHeight}px` : false }}>
                                <span /><span /><span />
                                <span /><span /><span />
                                <span /><span /><span />
                                {loaded && <div className="related-anime-list">{this.relatedAnimeList()}</div>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}