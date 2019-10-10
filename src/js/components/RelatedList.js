// React
import React, { Fragment, useContext } from 'react'

// Libraries
import has from 'has'

// Data
import { ModalState } from 'js/data/GlobalState'
import { ANIME_OBJECT } from 'js/data/Data'

// Helpers
import { replaceSpecialChars } from 'js/helpers/Modal'

// Components
import Badge from 'js/components/Badge'

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
    return relatedAnime.map(([ type, allAnime ]) =>
        <Fragment key={type}>
            <strong>{type}</strong>
            <ul className="related-list">
                {allAnime.map(anime =>
                    <RelatedListItem {...anime} key={anime.mal_id} />
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
        changeAnime(ANIME_OBJECT[anime.mal_id])
    }

    return (
        <li>
            <a className="has-text-overflow" href={anime.url} target="_blank" rel="noopener noreferrer">
                {replaceSpecialChars(anime.name)}
            </a>
            {has(ANIME_OBJECT, anime.mal_id) &&
                <Badge showRating onClick={onClick} {...ANIME_OBJECT[anime.mal_id]} />
            }
        </li>
    )
}

// Exports
export default RelatedList
