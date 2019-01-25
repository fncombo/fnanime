// Libraries
import ClassNames from 'classnames'
import FileSize from 'filesize'
import GetRenderedSize from 'react-rendered-size'
import PrettyTime from './PrettyTime'

// React
import React, { PureComponent, Fragment } from 'react'

// Style
import '../css/InfoBox.css'

// Components
import Data from './Data'

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
        const { closeInfoBox } = this.props

        fetch(`https://api.jikan.moe/v3/anime/${this.state.props.selectedAnimeId}`).then(response =>
            response.json()
        ).then(data => {
            if (data.hasOwnProperty('error')) {
                console.error('API responded with an error:', data.error)

                Data.loadingError()
                closeInfoBox()

                return
            }

            const synopsis = GetRenderedSize(this.synopsisText(data.synopsis), 865)

            // Emulate modal environment for calculating related anime list height
            let relatedAnimeContainer = document.createElement('div')
            relatedAnimeContainer.classList.add('modal')

            const relatedAnimeList = GetRenderedSize(this.relatedAnimeList(data.related), 865, {
                container: relatedAnimeContainer,
            })

            // Add 8 pixels to the height if there is a <ul> to account for the bottom margin
            const relatedAnimeListHeight = relatedAnimeList.height > 24 ? relatedAnimeList.height + 8 : relatedAnimeList.height

            this.setState({
                loaded: true,
                apiData: data,
                // Get the heights of the loaded synopsis and related anime data to animate smoothly
                synopsisHeight: synopsis.height,
                relatedAnimeListHeight: relatedAnimeListHeight,
            })
        }, error => {
            console.error('Error while fetching API:', error)

            Data.loadingError()
            closeInfoBox()
        })
    }

    // Replace special characters in synopsis text
    synopsisText(text) {
        return <p>{text.replace(/&#(\d+);/g, (match, p1) => String.fromCharCode(p1))}</p>
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

        const list = Object.entries(cleanData).map(([type, anime]) =>
            <Fragment key={type}>
                <h6>{type}</h6>
                <ul className="related">
                    {anime.map(anime =>
                        <li className="container" key={anime.mal_id}>
                            <a title="Open on MyAnimeList" href={anime.url} target="_blank" rel="noopener noreferrer">
                                {anime.name.replace(/&#(\d+);/g, (match, p1) => String.fromCharCode(p1))}
                            </a>
                            {Data.animeExists(anime.mal_id) &&
                                <span
                                    title="View"
                                    className={`status-pill status-pill-link status-pill-${Data.lookup.statusColor[Data.getAnime(anime.mal_id).status]}`}
                                    onClick={() => openInfoBox(anime.mal_id)}
                                >
                                    {Data.lookup.status[Data.getAnime(anime.mal_id).status]}
                                    {!!Data.getAnime(anime.mal_id).rating && ` - Rated ${Data.getAnime(anime.mal_id).rating}`}
                                </span>
                            }
                        </li>
                    )}
                </ul>
            </Fragment>
        )

        return <div>{list}</div>
    }

    render() {
        const { loaded, props, apiData, synopsisHeight, relatedAnimeListHeight } = this.state
        const { selectedAnimeId, closeInfoBox } = props

        // The anime we're talkin' about
        const anime = Data.getAnime(selectedAnimeId)

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
            durationText = `${PrettyTime(duration * anime.episodes, 'm')} ${anime.episodes > 1 ? `(${PrettyTime(duration, 'm')} per episode)` : ''}`
        }

        // Format how to display the total time if it can be worked out
        let watchTimeText = 'None'

        // If we don't know the duration of the anime or per episode, then we can't calculate it
        if (!duration) {
            watchTimeText = 'Unknown'

        // Otherwise calculate based on how many episodes have been watched
        } else if (duration && anime.watchedEpisodes) {
            watchTimeText = PrettyTime(duration * anime.watchedEpisodes * (anime.rewatchCount + 1))

            // If rewatched anime or it's a movie, say how many total times watched
            if (anime.rewatchCount || (anime.watchedEpisodes && anime.episodes === 1)) {
                watchTimeText += ` (watched ${anime.rewatchCount + 1} time${anime.rewatchCount + 1 > 1 ? 's' : ''})`

            // Otherwsie say how many episodes out of total have watched
            } else if (anime.watchedEpisodes && anime.episodes > 1) {
                watchTimeText += ` (${anime.watchedEpisodes}/${anime.episodes} episodes)`
            }
        }

        const loadingParagraphClasses = ClassNames('loading-paragraph', {
            'loaded': loaded,
        })

        return (
            <div className={`modal-content theme-${Data.lookup.statusColor[anime.status]}`}>
                <div className="modal-header">
                    <h4 className="modal-title">
                        <a title="Open on MyAnimeList" href={`https://myanimelist.net/anime/${anime.id}/${anime.url}`} target="_blank" rel="noopener noreferrer">
                            {anime.title}
                        </a>
                    </h4>
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
                                <h5>{anime.rating ? Data.lookup.rating[anime.rating] : 'Not Rated'}</h5>
                                {loaded ?
                                    <p>Average MAL rating: {apiData.score ? apiData.score : 'N/A'}</p> :
                                    <span className="loading-text mt-3" />}
                            </div>
                            <hr />
                            <p className="text-center mb-0">
                                {Data.lookup.type[anime.hasOwnProperty('typeActual') ? anime.typeActual : anime.type]} {String.fromCharCode(8211)} {anime.episodes} {anime.episodes > 1 ? 'episodes' : 'episode'}
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
                            <div className={loadingParagraphClasses} style={{ height: loaded ? `${synopsisHeight}px` : false }}>
                                <span /><span /><span />
                                <span /><span /><span />
                                <span /><span /><span />
                                {loaded && this.synopsisText(apiData.synopsis)}
                            </div>
                            <hr />
                            <h5>Related Anime</h5>
                            <div className={loadingParagraphClasses} style={{ height: loaded ? `${relatedAnimeListHeight}px` : false }}>
                                <span /><span /><span />
                                <span /><span /><span />
                                <span /><span /><span />
                                {loaded && this.relatedAnimeList()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}