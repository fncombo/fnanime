// React
import React, { Fragment, useState, useContext, useEffect } from 'react'
import ReactDOM from 'react-dom'

// Libraries
import fileSize from 'filesize'
import prettyTime from '../../lib/PrettyTime'
import { SlideDown } from 'react-slidedown'

// Style
import '../../css/Modal.css'
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

// Components
import Badge from './Badge'

// DOM element into which to portal the modal
const modalEl = document.getElementById('modal')

// Initial state of the modal
const modalInitialState = {
    isLoaded: false,
    apiData: {},
}

// Function to process title synonyms
function formatSynonyms(synonyms) {
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

    // Callback to chage the anime info inside the modal with a transition animation in betweem
    const changeAnime = newAnime => {
        document.body.classList.add('modal-changing')

        setTimeout(() => {
            document.body.classList.remove('modal-changing')

            setAnime(newAnime)
        }, 150)
    }

    // Callback to close the modal after it has finished animating out
    const closeModal = () => {
        document.body.classList.remove('modal-open')

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
        document.body.classList.add('modal-open')

        window.addEventListener('keyup', keyHandler)

        return () => {
            document.body.classList.remove('modal-open')

            window.removeEventListener('keyup', keyHandler)
        }
    })

    return (
        <div className="modal d-block">
            <div className="modal-overlay" onClick={closeModal} />
            <NavigationButton
                direction={ACTIONS.PREV_ANIME}
                changeAnime={changeAnime}
                currentAnimeId={anime.id}
            />
            <NavigationButton
                direction={ACTIONS.NEXT_ANIME}
                changeAnime={changeAnime}
                currentAnimeId={anime.id}
            />
            <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                <div className={`modal-content bg-${Filters.status.colorCodes[anime.status]}`}>
                    <div className="modal-header border-0 align-items-center">
                        <h5 className="modal-title">
                            <a href={anime.url} target="_blank" rel="noopener noreferrer">
                                {anime.title}
                            </a>
                        </h5>
                        <button className="close" onClick={closeModal}>&times;</button>
                    </div>
                    <div className="modal-body rounded">
                        <ModalBody closeModal={closeModal} changeAnime={changeAnime} {...anime} />
                    </div>
                </div>
            </div>
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
        // Loading addition data about the anime
        if (!isLoaded && !apiData.mal_id) {
            getAnimeApiData(anime.id, newApiData => {
                // Add a delay 2x the duration of animations to not make things too jumpy and give a sense
                // of loading (and to let the user appreciate the animation hah)
                setTimeout(() => {
                    setModalState({
                        isLoaded: true,
                        apiData: newApiData,
                    })
                }, 300)
            }, () => {
                alert('Something went wrong, sorry!')

                closeModal()
            })
        }

        // If the anime has changed, load in the new API data
        if (isLoaded && apiData.mal_id && anime.id !== apiData.mal_id) {
            setModalState({
                isLoaded: false,
                apiData: {},
            })
        }
    }, [ isLoaded, apiData.mal_id, anime.id, closeModal ])

    return (
        <ModalState.Provider value={{ modalState, changeAnime }}>
            <div className="row">
                <div className="col-3 text-center">
                    <img className="rounded" width="269" src={anime.img} alt={anime.title} />
                    <Rating rating={anime.rating} />
                    <LoadingText>
                        <p>Average rating: <ApiData property="score" fallback="N/A" /></p>
                    </LoadingText>
                    <hr />
                    <p className="mb-0">
                        {Filters.type.descriptions[anime.type]}
                        <Episodes episodes={anime.episodes} />
                    </p>
                    <LoadingText>
                        <p className="mb-0">Aired: <ApiData property="aired.string" fallback="N/A" /></p>
                    </LoadingText>
                    <div className="mt-3">
                        <Badge {...anime} />
                    </div>
                    <hr />
                    <a href={anime.url} target="_blank" rel="noopener noreferrer">
                        View on MyAnimeList.net
                    </a>
                </div>
                <div className="col-9">
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
                    <h5>Statistics</h5>
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
                        {!!anime.subs && <li><strong>Subtitles:</strong> {anime.subs}</li>}
                    </ul>
                    <hr />
                    <h5>Synopsis</h5>
                    <LoadingParagraph>
                        <Synopsis data={apiData.synopsis} />
                    </LoadingParagraph>
                    <hr />
                    <h5>Related Anime</h5>
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

    if (!navAnime) {
        return null
    }

    return (
        <div
            className={`modal-nav ${direction === ACTIONS.NEXT_ANIME ? 'next': 'prev'}`}
            title={navAnime.title}
            onClick={() => changeAnime(navAnime)}
        >
            <svg viewBox="0 0 10 10" className={`fill-${Filters.status.colorCodes[navAnime.status]}`}>
                {direction === ACTIONS.NEXT_ANIME
                    ? <polygon points="0,0 10,5 0,10" />
                    : <polygon points="0,5 10,0 10,10" />
                }
            </svg>
            <img className="rounded" width="74" height="100" src={navAnime.img} alt={navAnime.title} />
        </div>
    )
}

/**
 * Displays anime's rating using stars. Always shows 10 stars with different style for rating and filler.
 */
function Rating({ rating }) {
    if (!rating) {
        return <h5 className="mt-3">Not Rated</h5>
    }

    return (
        <>
            <h3>
                <span className="text-warning">
                    {Array(rating).fill('★')}
                </span>
                <span className="rating text-gray">
                    {Array(10 - rating).fill('★')}
                </span>
            </h3>
            <h5>{Filters.rating.descriptions[rating]}</h5>
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
    const { modalState: { isLoaded } } = useContext(ModalState)

    return isLoaded ? children : <span {...rest} />
}

/**
 * Inline, shorter loading placeholder.
 */
function LoadingInline({ children }) {
    return <Loading className="loading-text loading-inline col-3">{children}</Loading>
}

/**
 * Full line loading placeholder.
 */
function LoadingText({ children }) {
    return <Loading className="loading-text mb-0">{children}</Loading>
}

/**
 * A multi-line loading paragraphs placeholder which animates to the correct height when the content has loaded.
 */
function LoadingParagraph({ children }) {
    const { modalState: { isLoaded } } = useContext(ModalState)

    return (
        <SlideDown className={`loading-paragraph ${isLoaded ? 'loaded' : 'loading'}`}>
            <div className="placeholders">
                <span /><span />
                <span /><span />
                <span /><span />
                <span /><span />
                <span /><span />
            </div>
            <div className={`loading-content ${isLoaded ? 'loaded' : 'loading'}`}>
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
                <span className="text-gray">
                    &nbsp;&ndash; watched {rewatchCount + 1} time{rewatchCount + 1 > 1 ? 's' : ''}
                </span>
            </>
        )
    }

    // Otherwsie say how many episodes out of total have watched
    if (episodesWatched) {
        return (
            <>
                {watchTime}
                <span className="text-gray">
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
                <span className="text-gray">
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
            {episodes > 1 && <span className="text-gray"> &ndash; {episodeDuration} per episode</span>}
        </>
    )
}

/**
 * Synopsis text for this anime. Unfortunately the API returns it only all as one huge paragraph.
 */
function Synopsis({ data }) {
    if (!data || typeof data !== 'string') {
        return <p className="m-0">No synopsis</p>
    }

    return <p className="m-0">{replaceSpecialChars(data)}</p>
}

/**
 * List of all related anime grouped by their relation type. Anime which are present in the data
 * have badges which link to open that anime's modal.
 */
function RelatedList({ data }) {
    if (!data) {
        return null
    }

    // Get only related anime, i.e. filter out manga
    const getRelatedAnime = () =>
        Object.entries(data).reduce((object, [ relationType, anime ]) => {
            const newAnime = anime.filter(({ type }) => type === 'anime')

            if (newAnime.length) {
                object[relationType] = newAnime
            }

            return object
        }, {})

    const relatedAnime = Object.entries(getRelatedAnime())

    if (!relatedAnime.length) {
        return <p className="m-0">No related anime</p>
    }

    // Sub list for every relation type
    return relatedAnime.map(([ type, anime ]) =>
        <Fragment key={type}>
            <h6 className="m-0">{type}</h6>
            <ul className="pb-2">
                {anime.map(cartoon =>
                    <li className="d-flex align-items-center text-nowrap mx-0 my-1 ml-3" key={cartoon.mal_id}>
                        <a
                            className="text-truncate"
                            title="Open on MyAnimeList.net"
                            href={cartoon.url}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {replaceSpecialChars(cartoon.name)}
                        </a>
                        {AnimeObject.hasOwnProperty(cartoon.mal_id) &&
                            <Badge showRating={true} isLink={true} {...AnimeObject[cartoon.mal_id]} />
                        }
                    </li>
                )}
            </ul>
        </Fragment>
    )
}

// Exports
export default ModalContainer
