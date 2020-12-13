import React, { useContext } from 'react'
import PropTypes from 'prop-types'

import { ANIME_OBJECT } from 'src/helpers/data'
import { ModalState } from 'src/helpers/global-state'
import { replaceSpecialChars } from 'src/helpers/modal'

import Badge from 'src/components/Badge'

/**
 * Single item in the related anime list.
 */
export default function RelatedListItem({ anime: { mal_id: id, url, name } }) {
    const { changeAnime } = useContext(ModalState)

    // Callback to change the anime when clicking on the badge
    const onClick = () => {
        changeAnime(ANIME_OBJECT[id])
    }

    return (
        <li>
            <a className="has-text-overflow" href={url} target="_blank" rel="noopener noreferrer">
                {replaceSpecialChars(name)}
            </a>
            {!!ANIME_OBJECT[id] && <Badge hasRating onClick={onClick} anime={ANIME_OBJECT[id]} />}
        </li>
    )
}

RelatedListItem.propTypes = {
    anime: PropTypes.object.isRequired,
}
