// React
import React, { Fragment, useState, useContext, useEffect } from 'react'
import ReactDOM from 'react-dom'

// Libraries
import classNames from 'classnames'
import prettyTime from '../../lib/PrettyTime'
import { SlideDown } from 'react-slidedown'

// Style
import '../../scss/Modal.scss'
import 'react-slidedown/lib/slidedown.css'

// Data
import { ModalState, GlobalState, ACTIONS } from '../data/GlobalState'
import { AnimeObject } from '../data/Data'
import { Filters } from '../data/Filters'

// Helpers
import {
    getNestedProperty,
    replaceSpecialChars,
    convertDuration,
    getAdjacentAnime,
    getAnimeApiData,
} from '../helpers/Modal'
import fileSize from '../helpers/FileSize'
import Icon from '../helpers/Icon'

// Components
import Badge from './Badge'

// DOM element into which to portal the modal
const modalEl = document.getElementById('modal')

// Initial state of the modal
const modalInitialState = {
    isLoaded: false,
    isError: false,
    apiData: {},
}

// Function to process title synonyms
function formatSynonyms(synonyms) {
    // Fallback if for some reason this isn't an array as it should be
    if (!Array.isArray(synonyms) || !synonyms.length) {
        return <>&mdash;</>
    }

    return synonyms.join(', ')
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
                ReactDOM.createPortal(<Modal closeModal={closeModal} {...anime} />, modalEl)
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
        <div className="modal is-flex">
            <div className="modal-background" onClick={closeModal} />
            <NavigationButton
                direction={ACTIONS.PREV_ANIME}
                changeAnime={changeAnime}
                currentAnimeId={anime.id}
            />
            <div className={`modal-card has-background-${Filters.status.colorCodes[anime.status]}`}>
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
            <NavigationButton
                direction={ACTIONS.NEXT_ANIME}
                changeAnime={changeAnime}
                currentAnimeId={anime.id}
            />
        </div>
    )
}

/**
 * Body of the modal which contains all the information about the anime.
 */
function ModalBody({ closeModal, changeAnime, ...anime }) {
    const [ modalState, setModalState ] = useState(modalInitialState)
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
                    <img className="rounded" width="269" src={anime.img} alt={anime.title} />
                    <Rating rating={anime.rating} />
                    <LoadingText>
                        <p>Average rating: <ApiData property="score" fallback="N/A" /></p>
                    </LoadingText>
                    <hr />
                    <p>
                        {Filters.type.descriptions[anime.type]}
                        <Episodes episodes={anime.episodes} />
                    </p>
                    <LoadingText>
                        <p>Aired: <ApiData property="aired.string" fallback="N/A" /></p>
                    </LoadingText>
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
                                <ApiData property="title_synonyms" process={formatSynonyms} />
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
                            <LoadingInline>
                                <Duration {...apiData} {...anime} />
                            </LoadingInline>
                        </li>
                        <li>
                            <strong>Watch Time: </strong>
                            <LoadingInline>
                                <WatchTime {...apiData} {...anime} />
                            </LoadingInline>
                        </li>
                        {!!anime.subs && <li><strong>Release:</strong> {anime.subs}</li>}
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
    const classes = classNames('modal-nav', `has-text-${Filters.status.colorCodes[navAnime.status]}`, {
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
            <img className="rounded" width="74" height="100" src={navAnime.img} alt={navAnime.title} />
        </div>
    )
}

/**
 * Displays anime's rating using stars. Always shows 10 stars with different style for rating and filler.
 */
function Rating({ rating }) {
    if (!rating) {
        return <h5>Not Rated</h5>
    }

    return (
        <>
            <div className="rating">
                <span className="has-text-warning">
                    {Array(rating).fill(0).map((value, i) =>
                        <Icon icon={[ 'fas', 'star' ]} key={i} />
                    )}
                </span>
                <span className="has-text-grey-light">
                    {Array(10 - rating).fill(0).map((value, i) =>
                        <Icon icon={[ 'far', 'star' ]} key={i} />
                    )}
                </span>
            </div>
            <h5 className="title is-5">{Filters.rating.simpleDescriptions[rating]} &ndash; {rating}</h5>
        </>
    )
}

/**
 * Shows the number of episodes the anime has, if any?
 */
function Episodes({ episodes }) {
    if (!Number.isFinite(episodes)) {
        return <> &ndash; ? episodes</>
    }

    return <> &ndash; {episodes} episode{episodes > 1 ? 's' : ''}</>
}

/**
 * Single-line loading placeholder.
 */
function Loading({ children, ...rest }) {
    const { modalState: { isLoaded, isError } } = useContext(ModalState)

    if (isError) {
        return <LoadingError />
    }

    return isLoaded ? children : <span {...rest} />
}

/**
 * Inline, shorter loading placeholder.
 */
function LoadingInline({ children }) {
    return <Loading className="loading-text loading-inline">{children}</Loading>
}

/**
 * Full line loading placeholder.
 */
function LoadingText({ children }) {
    return <Loading className="loading-text">{children}</Loading>
}

function LoadingError() {
    return (
        <span className="modal-error has-text-danger">
            <Icon icon="exclamation-circle" /> An error has occurred
        </span>
    )
}

/**
 * A multi-line loading paragraphs placeholder which animates to the correct height when the content has loaded.
 */
function LoadingParagraph({ children }) {
    const { modalState: { isLoaded, isError } } = useContext(ModalState)

    if (isError) {
        return <LoadingError />
    }

    return (
        <SlideDown className={`loading-paragraph ${isLoaded ? 'is-loaded' : 'is-loading'}`}>
            <div className="placeholders">
                <span /><span />
                <span /><span />
                <span /><span />
                <span /><span />
                <span /><span />
            </div>
            <div className={`loading-content ${isLoaded ? 'is-loaded' : 'is-loading'}`}>
                {isLoaded ? children : null}
            </div>
        </SlideDown>
    )
}

/**
 * Attempt to get API data using a string property e.g. "foo.bar". Returns the found data or the fallback.
 */
function ApiData({ property, fallback = <>&mdash;</>, process }) {
    const { modalState: { apiData } } = useContext(ModalState)
    const data = getNestedProperty(apiData, ...property.split('.'))

    return (process ? process(data) : data) || fallback
}

/**
 * Display the total watch time of this anime based on episode duration and number of episodes watched.
 */
function WatchTime({ duration, episodes, episodesWatched, rewatchCount }) {
    if (!episodesWatched) {
        return 'None'
    }

    const convertedDuration = convertDuration(duration)

    if (!convertedDuration) {
        return 'Unknown'
    }

    const watchTime = prettyTime(convertedDuration * episodesWatched * (rewatchCount + 1))

    // If rewatched anime or it's a movie, say how many total times watched
    if (rewatchCount || (episodesWatched && episodes === 1)) {
        return (
            <>
                {watchTime}
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
                {watchTime}
                <span className="has-text-grey">
                    &nbsp;&ndash; {episodesWatched}/{episodes || '?'} episodes
                </span>
            </>
        )
    }

    return watchTime
}

/**
 * Display the anime size. If anime has episodes, also display the average size per episode.
 */
function Size({ size, episodes }) {
    return (
        <>
            {size ? fileSize(size) : 'Not Downloaded'}
            {(size && episodes > 1) &&
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
function Duration({ duration, episodes }) {
    const convertedDuration = convertDuration(duration)

    if (!convertedDuration || !episodes) {
        return 'Unknown'
    }

    const totalDuration = prettyTime(convertedDuration * episodes, 'm')
    const episodeDuration = prettyTime(convertedDuration, 'm')

    return (
        <>
            {totalDuration}
            {episodes > 1 && <span className="has-text-grey"> &ndash; {episodeDuration} per episode</span>}
        </>
    )
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

/**
 * List of all related anime grouped by their relation type. Anime which are present in the data
 * have badges which link to open that anime's modal.
 */
function RelatedList({ data }) {
    if (!data) {
        return null
    }

    const relatedAnime = Object.entries(data).reduce((relatedArray, [ relationType, relatedData ]) => {
        const animeOnly = relatedData.filter(({ type }) => type === 'anime')

        if (animeOnly.length) {
            relatedArray.push([ relationType, animeOnly ])
        }

        return relatedArray
    }, [])

    if (!relatedAnime.length) {
        return <p>No related anime</p>
    }

    // Sub list for every relation type
    return relatedAnime.map(([ type, anime ]) =>
        <Fragment key={type}>
            <strong>{type}</strong>
            <ul className="related-list">
                {anime.map(cartoon =>
                    <RelatedListItem {...cartoon} key={cartoon.mal_id} />
                )}
            </ul>
        </Fragment>
    )
}

/**
 * Single item in the related anime list.
 */
function RelatedListItem({ ...anime }) {
    const { changeAnime } = useContext(ModalState)

    const onClick = () => {
        changeAnime(AnimeObject[anime.mal_id])
    }

    return (
        <li>
            <a className="has-text-overflow" href={anime.url} target="_blank" rel="noopener noreferrer">
                {replaceSpecialChars(anime.name)}
            </a>
            {AnimeObject.hasOwnProperty(anime.mal_id) &&
                <Badge showRating isSmall onClick={onClick} {...AnimeObject[anime.mal_id]} />
            }
        </li>
    )
}

// Exports
export default ModalContainer
