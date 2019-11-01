// React
import React, { useContext } from 'react'

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
 * Single item in the related anime list.
 */
function RelatedListItem({ ...anime }) {
    const { changeAnime } = useContext(ModalState)

    // Callback to change the anime when clicking on the badge
    function onClickCallback() {
        changeAnime(ANIME_OBJECT[anime.mal_id])
    }

    return (
        <li>
            <a className="has-text-overflow" href={anime.url} target="_blank" rel="noopener noreferrer">
                {replaceSpecialChars(anime.name)}
            </a>
            {has(ANIME_OBJECT, anime.mal_id) &&
                <Badge showRating onClick={onClickCallback} {...ANIME_OBJECT[anime.mal_id]} />
            }
        </li>
    )
}

export default RelatedListItem
