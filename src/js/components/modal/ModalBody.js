// React
import React, { useState, useEffect } from 'react'

// Data
import { ModalState } from 'js/data/GlobalState'
import { FILTERS } from 'js/data/Filters'

// Helpers
import { getAnimeApiData } from 'js/helpers/Modal'

// Components
import Rating from 'js/components/modal/Rating'
import ApiData from 'js/components/modal/ApiData'
import Episodes from 'js/components/modal/Episodes'
import MultiValueData from 'js/components/modal/MultiValueData'
import Size from 'js/components/modal/Size'
import Duration from 'js/components/modal/Duration'
import WatchTime from 'js/components/modal/WatchTime'
import Synopsis from 'js/components/modal/Synopsis'
import RelatedList from 'js/components/modal/RelatedList'
import Favorite from 'js/components/Favorite'
import Badge from 'js/components/Badge'
import { LoadingInline, LoadingText, LoadingParagraph } from 'js/components/modal/Loading'

// Initial state of the modal
const INITIAL_MODAL_BODY_STATE = {
    isLoaded: false,
    isError: false,
    apiData: {},
}

/**
 * Body of the modal which contains all the information about the anime.
 */
function ModalBody({ closeModal, changeAnime, ...anime }) {
    const [ modalState, setModalState ] = useState(INITIAL_MODAL_BODY_STATE)
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
                    <Rating>
                        {anime.rating}
                    </Rating>
                    <Favorite showHash>
                        {anime.favorite}
                    </Favorite>
                    <hr />
                    <LoadingText>
                        <p>Mean MAL rating: <ApiData property="score" fallback="N/A" /></p>
                    </LoadingText>
                    <LoadingText>
                        <p>Rated by <ApiData property="scored_by" fallback="?" /> people</p>
                    </LoadingText>
                    <LoadingText>
                        <p>Ranked <ApiData property="rank" fallback="?">{n => `#${n.toLocaleString()}`}</ApiData></p>
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

export default ModalBody
