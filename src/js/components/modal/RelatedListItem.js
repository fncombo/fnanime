// React
import React, { useContext } from 'react'

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
export default function RelatedListItem({ mal_id: animeId, url, name }) {
    const { changeAnime } = useContext(ModalState)

    // Callback to change the anime when clicking on the badge
    function onClickCallback() {
        changeAnime(ANIME_OBJECT[animeId])
    }

    return (
        <li>
            <a className="has-text-overflow" href={url} target="_blank" rel="noopener noreferrer">
                {replaceSpecialChars(name)}
            </a>
            {!!ANIME_OBJECT[animeId] &&
                <Badge showRating onClick={onClickCallback} {...ANIME_OBJECT[animeId]} />
            }
        </li>
    )
}
