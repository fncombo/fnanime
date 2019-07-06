// Libraries
import FileSize from 'filesize'
import PrettyTime from '../lib/PrettyTime'
import AnimateHeight from 'react-animate-height'

// React
import React, { Component, PureComponent, Fragment } from 'react'

// Style
import '../css/InfoBox.css'

// Components
import Data from './Data'
import Badge from './Badge'

// Information box about a specific selected anime
export default class InfoBox extends Component {
    state = {
        loaded: false,
        props: {},
        apiData: {},
        synopsisHeight: 0,
        relatedAnimeListHeight: 0,
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
    }S

    // Get API data from Jikan about this anime, such as synopsis
    getApiData() {
        Data.getAnimeApiData(this.state.props.selectedAnimeId, apiData => {
            this.setState({
                loaded: true,
                apiData,
            })
        }, this.loadingError)
    }

    // Error when failed to load API
    loadingError() {
        const { closeInfoBox } = this.props

        closeInfoBox()

        alert('Error loading data from MyAnimeList.net, please try again later.')
    }

    render() {
        const { loaded, props, apiData, synopsisHeight, relatedAnimeListHeight } = this.state
        const { selectedAnimeId, openInfoBox, closeInfoBox, isDetailView } = props

        // The anime we're talkin' about
        const anime = Data.getAnime(selectedAnimeId)

        if (!anime) {
            return null
        }

        const prevAnimeId = Data.adjacentAnime('prev', selectedAnimeId)
        const nextAnimeId = Data.adjacentAnime('next', selectedAnimeId)

        const loadingParagraphClasses = `loading-paragraph ${loaded ? 'loaded' : ''}`

        return (
            <div className={`modal-content bg-${Data.filters.status.colorCodes[anime.status]}`}>
                {!!prevAnimeId && <NavigationButton direction="prev" animeId={prevAnimeId} openInfoBox={openInfoBox} />}
                {!!nextAnimeId && <NavigationButton direction="next" animeId={nextAnimeId} openInfoBox={openInfoBox} />}
                <div className="modal-header border-0">
                    <h4 className="modal-title ml-2">
                        <a className="text-white" title="Open on MyAnimeList.net" href={`https://myanimelist.net/anime/${anime.id}/${anime.url}`} target="_blank" rel="noopener noreferrer">
                            {anime.title}
                        </a>
                    </h4>
                    <button className="close" onClick={closeInfoBox}>
                        <span>&times;</span>
                    </button>
                </div>
                <div className={`modal-body rounded border-${Data.filters.status.colorCodes[anime.status]}`}>
                    <div className="row">
                        <div className="col-3 text-center">
                            <img className="rounded" width="268" src={anime.img} alt={anime.title} />
                            {anime.rating ?
                                <Fragment>
                                    <h3>
                                        <span className="text-warning">
                                            {Array(anime.rating).fill('★')}
                                        </span>
                                        <span className="text-secondary">
                                            {Array(10 - anime.rating).fill('★')}
                                        </span>
                                    </h3>
                                    <h5>{Data.filters.rating.descriptions[anime.rating]}</h5>
                                </Fragment> :
                                <h5 className="mt-3">Not Rated</h5>
                            }
                            {loaded ?
                                <p>Average MyAnimeList.net rating: {apiData.score ? apiData.score : 'N/A'}</p> :
                                <span className="loading-text mt-3" />
                            }
                            <hr />
                            <p className="mb-0">
                                {Data.filters.type.descriptions[anime.actualType]} &ndash; {anime.episodes || '?'} {anime.episodes === null || anime.episodes > 1 ? 'episodes' : 'episode'}
                            </p>
                            {loaded ?
                                <p className="mb-0">Aired {apiData.aired.string}</p> :
                                <span className="loading-text mb-0" />
                            }
                            <div className="mt-3">
                                <Badge animeId={anime.id} />
                            </div>
                            <hr />
                            <ul>
                                <li>
                                    <a href={`https://myanimelist.net/anime/${anime.id}/${anime.url}`} target="_blank" rel="noopener noreferrer">
                                        View on MyAnimeList.net
                                    </a>
                                </li>
                                {isDetailView &&
                                    <li>
                                        <a href={`https://nyaa.si/?f=0&c=1_2&q=${anime.title}`} target="_blank" rel="noopener noreferrer">
                                            Search on Nyaa
                                        </a>
                                    </li>
                                }
                            </ul>
                        </div>
                        <div className="col-9">
                            <ul>
                                <li>
                                    <strong>English Title: </strong>
                                    {loaded ?
                                        (apiData.title_english || <Fragment>&ndash;</Fragment>) :
                                        <span className="loading-text loading-inline col-3" />
                                    }
                                </li>
                                <li>
                                    <strong>Japanese Title: </strong>
                                    {loaded ?
                                        (apiData.title_japanese || <Fragment>&ndash;</Fragment>) :
                                        <span className="loading-text loading-inline col-3" />
                                    }
                                </li>
                                <li>
                                    <strong>Synonyms: </strong>
                                    {loaded ?
                                        (apiData.title_synonyms.length ? apiData.title_synonyms.join(', ') : <Fragment>&ndash;</Fragment>) :
                                        <span className="loading-text loading-inline col-3" />
                                    }
                                </li>
                            </ul>
                            <hr />
                            <h5>Statistics</h5>
                            <div className="row">
                                <div className="col-12">
                                    <ul>
                                        {isDetailView &&
                                            <li>
                                                <strong>Storage Size: </strong>
                                                {anime.size ? FileSize(anime.size) : 'Not Downloaded'}
                                                {(anime.size && anime.episodes > 1) && <span className="text-secondary"> &ndash; average {FileSize(anime.size / anime.episodes)} per episode</span>}
                                            </li>
                                        }
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
                                        {isDetailView && !!anime.subs && <li><strong>Subtitles:</strong> {anime.subs}</li>}
                                    </ul>
                                </div>
                            </div>
                            <hr />
                            <h5>Synopsis</h5>
                            <div className={loadingParagraphClasses} style={{ height: loaded && synopsisHeight ? `${synopsisHeight}px` : false }}>
                                {Array(10).fill(0).map((value, i) => <span key={i} />)}
                                <AnimateHeight height={loaded ? 'auto' : 0} duration={150} easing="ease-in-out" onAnimationStart={newHeight => this.setState({ synopsisHeight: newHeight.newHeight })}>
                                    {loaded && <Synopsis text={apiData.synopsis} />}
                                </AnimateHeight>
                            </div>
                            <hr />
                            <h5>Related Anime</h5>
                            <div className={loadingParagraphClasses} style={{ height: loaded && relatedAnimeListHeight ? `${relatedAnimeListHeight}px` : false }}>
                                {Array(10).fill(0).map((value, i) => <span key={i} />)}
                                <AnimateHeight height={loaded ? 'auto' : 0} duration={150} easing="ease-in-out" onAnimationStart={newHeight => this.setState({ relatedAnimeListHeight: newHeight.newHeight })}>
                                    {loaded && <RelatedList relatedData={apiData.related} openInfoBox={openInfoBox} />}
                                </AnimateHeight>
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
                className={`modal-nav modal-nav-${direction}`}
                title={Data.getAnime(animeId).title}
                onClick={() => openInfoBox(animeId)}
            >
                <polygon points={`0,${this.arrowSize/2} ${this.arrowSize},0 ${this.arrowSize},${this.arrowSize}`} />
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

        return <Fragment>{PrettyTime(duration * episodes, 'm')} {episodes > 1 && <span className="text-secondary">&ndash; {PrettyTime(duration, 'm')} per episode</span>}</Fragment>
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
            watchTime = <Fragment>{watchTime} <span className="text-secondary"> &ndash; watched {rewatchCount + 1} {rewatchCount + 1 > 1  ? 'times' : 'time'}</span></Fragment>

        // Otherwsie say how many episodes out of total have watched
        } else if (episodesWatched) {
            watchTime = <Fragment>{watchTime} <span className="text-secondary"> &ndash; {episodesWatched}/{episodes || '?'} episodes</span></Fragment>
        }

        return watchTime
    }
}

// Synopsis paragraph
class Synopsis extends PureComponent {
    render() {
        return <p className="m-0">{this.props.text ? this.props.text.replace(/&#(\d+);/g, (match, p1) => String.fromCharCode(p1)) : 'No synopsis'}</p>
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
            return <p className="m-0">No related anime</p>
        }

        const list = relatedAnime.map(([type, anime]) =>
            <Fragment key={type}>
                <h6 className="m-0">{type}</h6>
                <ul className="pb-2">
                    {anime.map(anime =>
                        <li className="d-flex align-items-center text-nowrap mx-0 my-1 ml-3" key={anime.mal_id}>
                            <a className="text-truncate" title="Open on MyAnimeList.net" href={anime.url} target="_blank" rel="noopener noreferrer">
                                {anime.name.replace(/&#(\d+);/g, (match, p1) => String.fromCharCode(p1))}
                            </a>
                            {Data.animeExists(anime.mal_id) &&
                                <Badge animeId={anime.mal_id} showRating={true} isLink={true} openInfoBox={openInfoBox} />
                            }
                        </li>
                    )}
                </ul>
            </Fragment>
        )

        return list
    }
}
