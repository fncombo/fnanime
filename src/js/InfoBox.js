// Libraries
import ClassNames from 'classnames'
import FileSize from 'filesize'
import GetRenderedSize from 'react-rendered-size'
import PrettyTime from '../lib/PrettyTime'

// React
import React, { Component, PureComponent, Fragment } from 'react'

// Style
import '../css/InfoBox.css'

// Components
import Data from './Data'
import StatusPill from './StatusPill'

// Information box about a specific selected anime
export default class InfoBox extends Component {
    state = {
        loaded: false,
        props: {},
        apiData: {},
        synopsis: null,
        synopsisHeight: 0,
        relatedAnimeList: null,
        relatedAnimeListHeight: 0,
    }

    width = 867

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
        const { openInfoBox, closeInfoBox } = this.props

        fetch(`https://api.jikan.moe/v3/anime/${this.state.props.selectedAnimeId}`).then(response =>
            response.json()
        ).then(apiData => {
            if (apiData.hasOwnProperty('error')) {
                console.error('API responded with an error:', apiData.error)
                this.loadingError()
                closeInfoBox()
                return
            }

            // Calculate the height of the synopsis
            const synopsis = <Synopsis text={apiData.synopsis} />
            const synopsisHeight = GetRenderedSize(synopsis, this.width).height

            // Emulate modal environment for calculating related anime list height
            const relatedAnimeContainer = document.createElement('div')
            relatedAnimeContainer.classList.add('modal')

            // Calculate height of the related anime list
            const relatedAnimeList = <RelatedList relatedData={apiData.related} openInfoBox={openInfoBox} />
            let relatedAnimeListHeight = GetRenderedSize(relatedAnimeList, this.width, {
                container: relatedAnimeContainer,
            }).height

            // Add 8 pixels to the height if there is a <ul> to account for the bottom margin
            relatedAnimeListHeight = relatedAnimeListHeight > 24 ? relatedAnimeListHeight + 8 : relatedAnimeListHeight

            this.setState({
                loaded: true,
                apiData,
                synopsis,
                synopsisHeight,
                relatedAnimeList,
                relatedAnimeListHeight,
            })
        }, error => {
            console.error('Error while fetching API:', error)
            this.loadingError()
            closeInfoBox()
        })
    }

    // Error when failed to load API
    loadingError() {
        alert('Error loading data from MyAnimeList.net, please try again later.')
    }

    render() {
        const { loaded, props, apiData, synopsis, synopsisHeight, relatedAnimeList, relatedAnimeListHeight } = this.state
        const { selectedAnimeId, openInfoBox, closeInfoBox } = props

        // The anime we're talkin' about
        const anime = Data.getAnime(selectedAnimeId)

        if (!anime) {
            return null
        }

        const prevAnimeId = Data.adjacentAnime('prev', selectedAnimeId)
        const nextAnimeId = Data.adjacentAnime('next', selectedAnimeId)

        const loadingParagraphClasses = ClassNames('loading-paragraph', {
            'loaded': loaded,
        })

        return (
            <div className={`modal-content theme-${Data.lookup.statusColor[anime.status]}`}>
                {!!prevAnimeId && <NavigationButton direction="prev" animeId={prevAnimeId} openInfoBox={openInfoBox} />}
                {!!nextAnimeId && <NavigationButton direction="next" animeId={nextAnimeId} openInfoBox={openInfoBox} />}
                <div className="modal-header">
                    <h4 className="modal-title">
                        <StatusPill animeId={anime.id} />
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
                                    {Array(anime.rating).fill('★')}
                                </span>
                                <span className="inactive">
                                    {Array(10 - anime.rating).fill('★')}
                                </span>
                                <h5>{anime.rating ? Data.lookup.rating[anime.rating] : 'Not Rated'}</h5>
                                {loaded ?
                                    <p>Average MAL rating: {apiData.score ? apiData.score : 'N/A'}</p> :
                                    <span className="loading-text mt-3" />
                                }
                            </div>
                            <hr />
                            <p className="text-center mb-0">
                                {Data.getAnimeTypeText(anime.id)} &ndash; {anime.episodes} {anime.episodes > 1 ? 'episodes' : 'episode'}
                            </p>
                            {loaded ?
                                <p className="text-center mb-0">Aired {apiData.aired.string}</p> :
                                <span className="loading-text mb-0" />
                            }
                            <hr />
                            <ul>
                                <li>
                                    <a href={`https://myanimelist.net/anime/${anime.id}/${anime.url}`} target="_blank" rel="noopener noreferrer">
                                        View on MyAnimeList
                                    </a>
                                </li>
                                <li>
                                    <a href={`https://nyaa.si/?f=0&c=1_2&q=${anime.title}`} target="_blank" rel="noopener noreferrer">
                                        Search on Nyaa
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div className="col-9">
                            <h5>Statistics</h5>
                            <div className="row">
                                <div className="col-12">
                                    <ul>
                                        <li>
                                            <strong>Storage Size: </strong>
                                            {anime.downloaded ? FileSize(anime.size) : 'Not Downloaded'}
                                            {(anime.downloaded && anime.episodes > 1) && <Fragment> (average {FileSize(anime.size / anime.episodes)} per episode)</Fragment>}
                                        </li>
                                        <li>
                                            <strong>Duration: </strong>
                                            {loaded ?
                                                <Duration duration={apiData.duration} episodes={anime.episodes} /> :
                                                <span className="loading-text loading-inline col-3" />
                                            }
                                        </li>
                                        <li>
                                            <strong>Watch Time: </strong>
                                            {loaded ?
                                                <WatchTime duration={apiData.duration} episodes={anime.episodes} episodesWatched={anime.episodesWatched} rewatchCount={anime.rewatchCount} /> :
                                                <span className="loading-text loading-inline col-3" />
                                            }
                                        </li>
                                        {!!anime.subs && <li><strong>Subtitles:</strong> {anime.subs}</li>}
                                        {anime.downloaded && <li><strong>Quality:</strong> {anime.resolution ? `${anime.resolution}p` : ''} {anime.source}</li>}
                                    </ul>
                                </div>
                            </div>
                            <hr />
                            <h5>Synopsis</h5>
                            <div className={loadingParagraphClasses} style={{ height: loaded ? `${synopsisHeight}px` : false }}>
                                {Array(10).fill(0).map((value, i) => <span key={i} />)}
                                {loaded && synopsis}
                            </div>
                            <hr />
                            <h5>Related Anime</h5>
                            <div className={loadingParagraphClasses} style={{ height: loaded ? `${relatedAnimeListHeight}px` : false }}>
                                {Array(10).fill(0).map((value, i) => <span key={i} />)}
                                {loaded && relatedAnimeList}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

// Previos and next navigation buttons
class NavigationButton extends PureComponent {
    arrowSize = 32

    render() {
        const { direction, animeId, openInfoBox } = this.props

        return (
            <svg
                height={this.arrowSize}
                width={this.arrowSize}
                className={`modal-controls modal-controls-${direction}`}
                title={Data.getAnime(animeId).title}
                onClick={() => openInfoBox(animeId)}
            >
                <polygon points={`1,${this.arrowSize/2} ${this.arrowSize-1},1 ${this.arrowSize-1},${this.arrowSize-1}`} />
            </svg>
        )
    }
}

// Display the total duration of the anime, and per episode duration
class Duration extends PureComponent {
    render() {
        let { duration, episodes } = this.props

        duration = Data.convertDuration(duration)

        if (!duration || !episodes) {
            return 'Unknown'
        }

        return `${PrettyTime(duration * episodes, 'm')} ${episodes > 1 ? `(${PrettyTime(duration, 'm')} per episode)` : ''}`
    }
}

// Display the total watch time of this anime based on episodes watched
class WatchTime extends PureComponent {
    render() {
        let { duration, episodes, episodesWatched, rewatchCount } = this.props

        duration = Data.convertDuration(duration)

        if (!episodesWatched) {
            return 'None'
        }

        if (!duration) {
            return 'Unknown'
        }

        let watchTime = PrettyTime(duration * episodesWatched * (rewatchCount + 1))

        // If rewatched anime or it's a movie, say how many total times watched
        if (rewatchCount || (episodesWatched && episodes === 1)) {
            watchTime += ` (watched ${rewatchCount + 1} time${rewatchCount + 1 > 1 ? 's' : ''})`

        // Otherwsie say how many episodes out of total have watched
        } else if (episodesWatched) {
            watchTime += ` (${episodesWatched}/${episodes || '?'} episodes)`
        }

        return watchTime
    }
}

// Synopsis paragraph
class Synopsis extends PureComponent {
    render() {
        return <p>{this.props.text.replace(/&#(\d+);/g, (match, p1) => String.fromCharCode(p1))}</p>
    }
}

// List of all the related anime
class RelatedList extends PureComponent {
    // Remove non-anime related entries
    removeUnwantedRelatedData(data) {
        const newData = {}

        Object.entries(data).forEach(([type, anime]) => {
            const newAnime = anime.filter(anime => anime.type === 'anime')

            if (newAnime.length) {
                newData[type] = anime
            }
        })

        return newData
    }

    render() {
        const { relatedData, openInfoBox } = this.props

        const relatedAnime = Object.entries(this.removeUnwantedRelatedData(relatedData))

        if (!relatedAnime.length) {
            return <p>No related anime</p>
        }

        const list = relatedAnime.map(([type, anime]) =>
            <Fragment key={type}>
                <h6>{type}</h6>
                <ul className="related">
                    {anime.map(anime =>
                        <li className="container" key={anime.mal_id}>
                            <a title="Open on MyAnimeList" href={anime.url} target="_blank" rel="noopener noreferrer">
                                {anime.name.replace(/&#(\d+);/g, (match, p1) => String.fromCharCode(p1))}
                            </a>
                            {Data.animeExists(anime.mal_id) &&
                                <StatusPill animeId={anime.mal_id} showRating={true} isLink={true} openInfoBox={openInfoBox} />
                            }
                        </li>
                    )}
                </ul>
            </Fragment>
        )

        return <div>{list}</div>
    }
}