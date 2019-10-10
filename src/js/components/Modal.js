// React
import React, { useState, useContext, useEffect } from 'react'
import ReactDOM from 'react-dom'

// Libraries
import has from 'has'
import classNames from 'classnames'

// Style
import 'scss/Modal.scss'
import 'react-slidedown/lib/slidedown.css'

// Data
import { ModalState, GlobalState, ACTIONS } from 'js/data/GlobalState'
import { FILTERS } from 'js/data/Filters'

// Helpers
import {
    getNestedProperty,
    replaceSpecialChars,
    getAdjacentAnime,
    getAnimeApiData,
} from 'js/helpers/Modal'
import { formatDuration } from 'js/helpers/Statistics'
import fileSize from 'js/helpers/FileSize'

// Components
import RelatedList from 'js/components/RelatedList'
import Badge from 'js/components/Badge'
import Icon from 'js/components/Icon'
import Favorite from 'js/components/Favorite'
import { LoadingInline, LoadingText, LoadingParagraph } from 'js/components/Loading'

// DOM element into which to portal the modal
const MODAL_ELEMENT = document.getElementById('modal')

// Initial state of the modal
const INITIAL_MODAL_STATE = {
    isLoaded: false,
    isError: false,
    apiData: {},
}

/**
 * Makes any element a button to open a portal to a modal.
 */
function ModalContainer({ as: Element = 'a', anime, children, ...rest }) {
    const [ isModalOpen, setModalOpen ] = useState(false)

    // Callback to open the modal when the main element is clicked
    const openModal = event => {
        if (event.button === 0) {
            event.preventDefault()

            setModalOpen(true)
        }
    }

    // Callback to close the modal
    const closeModal = () => {
        setModalOpen(false)
    }

    return (
        <>
            <Element onClick={openModal} {...rest}>
                {children}
            </Element>
            {isModalOpen &&
                ReactDOM.createPortal(<Modal closeModal={closeModal} {...anime} />, MODAL_ELEMENT)
            }
        </>
    )
}

/**
 * All the modal HTML including managing what it's displaying and its animations.
 */
function Modal({ closeModal: closeCallback, ...props }) {
    const { state: { anime: allAnime } } = useContext(GlobalState)
    const [ anime, setAnime ] = useState(props)

    // Callback to change the anime info inside the modal with a transition animation in between
    const changeAnime = newAnime => {
        document.body.classList.add('is-changing')

        setTimeout(() => {
            document.body.classList.remove('is-changing')

            setAnime(newAnime)
        }, 150)
    }

    // Callback to close the modal after it has finished animating out
    const closeModal = () => {
        document.body.classList.remove('is-active')

        setTimeout(() => {
            closeCallback()
        }, 150)
    }

    // Switch between next and previous anime using arrow keys and close the modal using esc
    const keyHandler = ({ key }) => {
        if (key === 'Escape') {
            closeModal()
        }

        if (key !== 'ArrowLeft' && key !== 'ArrowRight') {
            return
        }

        const direction = key === 'ArrowLeft' ? ACTIONS.PREV_ANIME : ACTIONS.NEXT_ANIME
        const adjacentAnime = getAdjacentAnime(allAnime, anime.id, direction)

        if (adjacentAnime) {
            changeAnime(adjacentAnime)
        }
    }

    // Add and remove the modal open classes from the body
    useEffect(() => {
        document.body.classList.add('is-active')

        document.documentElement.classList.add('is-clipped')

        window.addEventListener('keyup', keyHandler)

        return () => {
            document.body.classList.remove('is-active')

            document.documentElement.classList.remove('is-clipped')

            window.removeEventListener('keyup', keyHandler)
        }
    })

    return (
        <div className="modal">
            <div className="modal-background" onClick={closeModal} />
            <NavigationButton direction={ACTIONS.PREV_ANIME} changeAnime={changeAnime} currentAnimeId={anime.id} />
            <div className={`modal-card has-background-${FILTERS.status.colorCodes[anime.status]}`}>
                <div className="modal-card-head">
                    <h5 className="modal-card-title">
                        <a href={anime.url} target="_blank" rel="noopener noreferrer">
                            {anime.title}
                        </a>
                    </h5>
                    <Icon as="button" icon="times-circle" size="lg" onClick={closeModal} />
                </div>
                <div className="modal-card-body">
                    <ModalBody closeModal={closeModal} changeAnime={changeAnime} {...anime} />
                </div>
            </div>
            <NavigationButton direction={ACTIONS.NEXT_ANIME} changeAnime={changeAnime} currentAnimeId={anime.id} />
        </div>
    )
}

/**
 * Body of the modal which contains all the information about the anime.
 */
function ModalBody({ closeModal, changeAnime, ...anime }) {
    const [ modalState, setModalState ] = useState(INITIAL_MODAL_STATE)
    const { isLoaded, apiData } = modalState

    useEffect(() => {
        async function fetchData() {
            // Loading addition data about the anime
            if (!isLoaded && !apiData.mal_id) {
                let loadingApiData

                try {
                    loadingApiData = await getAnimeApiData(anime.id)
                } catch (error) {
                    setModalState({
                        isLoaded: true,
                        isError: true,
                        apiData: {},
                    })

                    return
                }

                // Add a delay 2x the duration of animations to not make things too jumpy and give a sense
                // of loading (and to let the user appreciate the animation, hah!)
                setTimeout(() => {
                    setModalState({
                        isLoaded: true,
                        apiData: loadingApiData,
                    })
                }, 300)
            }

            // If the anime has changed, load in the new API data
            if (isLoaded && apiData.mal_id && anime.id !== apiData.mal_id) {
                setModalState({
                    isLoaded: false,
                    apiData: {},
                })
            }
        }

        fetchData()
    }, [ isLoaded, apiData.mal_id, anime.id, closeModal ])

    return (
        <ModalState.Provider value={{ modalState, changeAnime }}>
            <div className="columns">
                <div className="column is-3 has-text-centered">
                    <img width="269" className="rounded" src={anime.img} alt={anime.title} />
                    <Rating rating={anime.rating} />
                    {!!anime.favorite && <Favorite number={anime.favorite} />}
                    <hr />
                    <LoadingText>
                        <p>Mean MAL rating: <ApiData property="score" fallback="N/A" /></p>
                    </LoadingText>
                    <LoadingText>
                        <p>Rated by <ApiData property="scored_by" fallback="?" /> people</p>
                    </LoadingText>
                    <LoadingText>
                        <p>Ranked <ApiData property="rank" fallback="?">{rank =>
                            `#${rank.toLocaleString()}`
                        }</ApiData></p>
                    </LoadingText>
                    <hr />
                    <p>
                        {FILTERS.type.descriptions[anime.type]}
                        <Episodes episodes={anime.episodes} />
                    </p>
                    {anime.airStatus === 2
                        ? <LoadingText><p>Aired: <ApiData property="aired.string" fallback="N/A" /></p></LoadingText>
                        : <p>{FILTERS.airStatus.descriptions[anime.airStatus]}</p>
                    }
                    <div className="status">
                        <Badge {...anime} />
                    </div>
                    <hr />
                    <a href={anime.url} target="_blank" rel="noopener noreferrer">
                        View on MyAnimeList.net
                    </a>
                </div>
                <div className="column is-9">
                    <ul>
                        <li>
                            <strong>English Title: </strong>
                            <LoadingInline>
                                <ApiData property="title_english" />
                            </LoadingInline>
                        </li>
                        <li>
                            <strong>Japanese Title: </strong>
                            <LoadingInline>
                                <ApiData property="title_japanese" />
                            </LoadingInline>
                        </li>
                        <li>
                            <strong>Synonyms: </strong>
                            <LoadingInline>
                                <ApiData property="title_synonyms">
                                    {synonyms => <MultiValueData data={synonyms} />}
                                </ApiData>
                            </LoadingInline>
                        </li>
                    </ul>
                    <hr />
                    <h5 className="title is-5">Statistics</h5>
                    <ul>
                        <li>
                            <strong>Storage Size: </strong>
                            <Size size={anime.size} episodes={anime.episodes} />
                        </li>
                        <li>
                            <strong>Duration: </strong>
                            <Duration {...anime} />
                        </li>
                        <li>
                            <strong>Watch Time: </strong>
                            <WatchTime {...anime} />
                        </li>
                        <li>
                            <strong>Release: </strong>
                            <MultiValueData data="subs" {...anime} />
                        </li>
                        <li>
                            <strong>Genres: </strong>
                            <MultiValueData data="genres" {...anime} />
                        </li>
                        <li>
                            <strong>Studios: </strong>
                            <MultiValueData data="studios" {...anime} />
                        </li>
                    </ul>
                    <hr />
                    <h5 className="title is-5">Synopsis</h5>
                    <LoadingParagraph>
                        <Synopsis data={apiData.synopsis} />
                    </LoadingParagraph>
                    <hr />
                    <h5 className="title is-5">Related Anime</h5>
                    <LoadingParagraph>
                        <RelatedList data={apiData.related} />
                    </LoadingParagraph>
                </div>
            </div>
        </ModalState.Provider>
    )
}

/**
 * Previous and next buttons around the modal to quickly switch between adjacent anime.
 */
function NavigationButton({ direction, changeAnime, currentAnimeId }) {
    const { state: { anime: allAnime } } = useContext(GlobalState)

    const navAnime = getAdjacentAnime(allAnime, currentAnimeId, direction)
    const classes = classNames('modal-nav', `has-text-${FILTERS.status.colorCodes[navAnime.status]}`, {
        'is-placeholder': !navAnime,
        'is-next': direction === ACTIONS.NEXT_ANIME,
        'is-prev': direction !== ACTIONS.NEXT_ANIME,
    })

    if (!navAnime) {
        return <div className={classes} />
    }

    const icon = direction === ACTIONS.NEXT_ANIME ? 'chevron-right' : 'chevron-left'

    return (
        <div className={classes} title={navAnime.title} onClick={() => changeAnime(navAnime)}>
            {<Icon icon={icon} className="is-medium" size="2x" />}
            <img width="74" height="100" className="rounded" src={navAnime.img} alt={navAnime.title} />
        </div>
    )
}

/**
 * Displays anime's rating using stars. Always shows 10 stars with different style for rating and filler.
 * Defaults to "not rated" for falsy ratings.
 */
function Rating({ rating }) {
    return (
        <>
            <div className="rating">
                <span className="has-text-warning">
                    {Array.from({ length: rating }, (value, i) =>
                        <Icon icon={[ 'fas', 'star' ]} key={i} />
                    )}
                </span>
                <span className="has-text-grey-light">
                    {Array.from({ length: 10 - rating }, (value, i) =>
                        <Icon icon={[ 'far', 'star' ]} key={i} />
                    )}
                </span>
            </div>
            <h5 className="title is-5">
                {FILTERS.rating.simpleDescriptions[rating || null]}{!!rating && <> &ndash; {rating}</>}
            </h5>
        </>
    )
}

/**
 * Shows the number of episodes the anime has, if any?
 */
function Episodes({ episodes }) {
    if (!episodes) {
        return <> &ndash; ? episodes</>
    }

    return <> &ndash; {episodes} episode{episodes > 1 ? 's' : ''}</>
}

/**
 * Attempt to get API data using a string property e.g. "foo.bar". Returns the found data or the fallback.
 */
function ApiData({ property, fallback = <>&mdash;</>, children }) {
    const { modalState: { apiData } } = useContext(ModalState)
    const data = getNestedProperty(apiData, ...property.split('.'))

    // No such API data or it's empty, return the fallback
    if (!data) {
        return fallback
    }

    // Function provided, pass the data to it
    if (typeof children === 'function') {
        return children(data)
    }

    // The data is a number, format it properly
    if (/^\d+$/.test(data)) {
        return data.toLocaleString()
    }

    return data
}

/**
 * Display the total watch time of this anime based on episode duration and number of episodes watched.
 */
function WatchTime({ episodeDuration, episodes, episodesWatched, watchTime, rewatchCount }) {
    if (!episodeDuration || !episodesWatched) {
        return 'None'
    }

    // If rewatched anime or it's a movie, say how many total times watched
    if (rewatchCount || (episodesWatched && episodes === 1)) {
        return (
            <>
                {formatDuration(watchTime, true)}
                <span className="has-text-grey">
                    &nbsp;&ndash; watched {rewatchCount + 1} time{rewatchCount + 1 > 1 ? 's' : ''}
                </span>
            </>
        )
    }

    // Otherwise say how many episodes out of total have watched
    if (episodesWatched) {
        return (
            <>
                {formatDuration(watchTime, true)}
                <span className="has-text-grey">
                    &nbsp;&ndash; {episodesWatched}/{episodes || '?'} episodes
                </span>
            </>
        )
    }

    return formatDuration(watchTime, true)
}

/**
 * Display the anime size. If anime has episodes, also display the average size per episode.
 */
function Size({ size, episodes }) {
    return (
        <>
            {size ? fileSize(size) : 'Not Downloaded'}
            {!!(size && episodes > 1) &&
                <span className="has-text-grey">
                    &nbsp;&ndash; average {fileSize(size / episodes)} per episode
                </span>
            }
        </>
    )
}

/**
 * Display the total duration of the anime, and the duration per episode.
 */
function Duration({ episodeDuration, episodes }) {
    if (!episodeDuration || !episodes) {
        return 'Unknown'
    }

    return (
        <>
            {formatDuration(episodeDuration * episodes, true)}
            {episodes > 1 &&
                <span className="has-text-grey"> &ndash; {formatDuration(episodeDuration, true)} per episode</span>
            }
        </>
    )
}

/**
 * Array of values which should be comma-separated. Can look up description from filters.
 */
function MultiValueData({ data, ...anime }) {
    if (!data) {
        return <>&mdash;</>
    }

    if (Array.isArray(data) && data.length) {
        return data.join(', ')
    }

    if (!has(anime, data) || !Array.isArray(anime[data]) || !anime[data].length) {
        return <>&mdash;</>
    }

    return anime[data].map(value => {
        if (has(FILTERS, data) && has(FILTERS[data].descriptions, value)) {
            return FILTERS[data].descriptions[value]
        }

        return value
    }).join(', ')
}

/**
 * Synopsis text for this anime. Unfortunately the API returns it only all as one huge paragraph.
 */
function Synopsis({ data }) {
    if (!data || typeof data !== 'string') {
        return <p>No synopsis</p>
    }

    return <p>{replaceSpecialChars(data)}</p>
}

// Exports
export default ModalContainer
