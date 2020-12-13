import React from 'react'
import PropTypes from 'prop-types'

import axios from 'axios'
import { useQuery } from 'react-query'

import { FILTERS } from 'src/helpers/filters'
import { PROP_TYPES } from 'src/helpers/generic'
import { ModalState } from 'src/helpers/global-state'

import Badge from 'src/components/Badge'
import Favorite from 'src/components/Favorite'
import ApiData from 'src/components/modal/ApiData'
import Duration from 'src/components/modal/Duration'
import Episodes from 'src/components/modal/Episodes'
import { LoadingInline, LoadingParagraph, LoadingText } from 'src/components/modal/Loading'
import MultiValueData from 'src/components/modal/MultiValueData'
import Rating from 'src/components/modal/Rating'
import RelatedList from 'src/components/modal/RelatedList'
import Size from 'src/components/modal/Size'
import Synopsis from 'src/components/modal/Synopsis'
import WatchTime from 'src/components/modal/WatchTime'

/**
 * Body of the modal which contains all the information about the anime.
 */
export default function ModalBody({ changeAnime, anime }) {
    const { data: { data = {} } = {}, isLoading, isError } = useQuery(`${anime.id}`, async () =>
        axios.get(`https://api.jikan.moe/v3/anime/${anime.id}`)
    )

    return (
        <ModalState.Provider value={{ data, isLoading, isError, changeAnime }}>
            <div className="columns">
                <div className="column is-3 has-text-centered">
                    <img width="269" className="rounded" src={anime.img} alt={anime.title} />
                    <Rating>{anime.rating}</Rating>
                    <Favorite hasHash>{anime.favorite}</Favorite>
                    <hr />
                    <LoadingText>
                        <p>
                            Mean MAL rating: <ApiData data="score" fallback="N/A" />
                        </p>
                    </LoadingText>
                    <LoadingText>
                        <p>
                            Rated by <ApiData data="scored_by" fallback="?" /> people
                        </p>
                    </LoadingText>
                    <LoadingText>
                        <p>
                            <ApiData data="rank" fallback="Ranked ?">
                                {(rankNumber) => `Ranked #${rankNumber.toLocaleString()}`}
                            </ApiData>
                        </p>
                    </LoadingText>
                    <hr />
                    <p>
                        {FILTERS.type.descriptions[anime.type]}
                        <Episodes>{anime.episodes}</Episodes>
                    </p>
                    {anime.airStatus === 2 ? (
                        <LoadingText>
                            <p>
                                Aired: <ApiData data={(apiData) => apiData?.aired?.string} fallback="N/A" />
                            </p>
                        </LoadingText>
                    ) : (
                        <p>{FILTERS.airStatus.descriptions[anime.airStatus]}</p>
                    )}
                    <div className="status">
                        <Badge anime={anime} />
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
                                <ApiData data="title_english" />
                            </LoadingInline>
                        </li>
                        <li>
                            <strong>Japanese Title: </strong>
                            <LoadingInline>
                                <ApiData data="title_japanese" />
                            </LoadingInline>
                        </li>
                        <li>
                            <strong>Synonyms: </strong>
                            <LoadingInline>
                                <ApiData data="title_synonyms">
                                    {(synonyms) => <MultiValueData data={synonyms} />}
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
                            <Duration anime={anime} />
                        </li>
                        <li>
                            <strong>Watch Time: </strong>
                            <WatchTime anime={anime} />
                        </li>
                        <li>
                            <strong>Release: </strong>
                            <MultiValueData data="subs" anime={anime} />
                        </li>
                        <li>
                            <strong>Genres: </strong>
                            <MultiValueData data="genres" anime={anime} />
                        </li>
                        <li>
                            <strong>Studios: </strong>
                            <MultiValueData data="studios" anime={anime} />
                        </li>
                    </ul>
                    <hr />
                    <h5 className="title is-5">Synopsis</h5>
                    <LoadingParagraph>
                        <Synopsis>{data.synopsis}</Synopsis>
                    </LoadingParagraph>
                    <hr />
                    <h5 className="title is-5">Related Anime</h5>
                    <LoadingParagraph>
                        <RelatedList data={data.related} />
                    </LoadingParagraph>
                </div>
            </div>
        </ModalState.Provider>
    )
}

ModalBody.propTypes = {
    changeAnime: PropTypes.func.isRequired,
    anime: PROP_TYPES.ANIME.isRequired,
}
