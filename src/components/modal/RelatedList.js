import React, { Fragment } from 'react'
import PropTypes from 'prop-types'

import RelatedListItem from 'src/components/modal/RelatedListItem'

/**
 * List of all related anime grouped by their relation type. Anime which are present in the data
 * have badges which link to open that anime's modal.
 */
export default function RelatedList({ data }) {
    if (!data) {
        return null
    }

    const relatedAnime = Object.entries(data).reduce((relatedArray, [relationType, relatedData]) => {
        const animeOnly = relatedData.filter(({ type }) => type === 'anime')

        if (animeOnly.length) {
            relatedArray.push([relationType, animeOnly])
        }

        return relatedArray
    }, [])

    if (!relatedAnime.length) {
        return <p>No related anime</p>
    }

    // Sub list for every relation type
    return relatedAnime.map(([type, allAnime]) => (
        <Fragment key={type}>
            <strong>{type}</strong>
            <ul className="related-list">
                {allAnime.map((anime) => (
                    <RelatedListItem key={anime.mal_id} anime={anime} />
                ))}
            </ul>
        </Fragment>
    ))
}

RelatedList.propTypes = {
    data: PropTypes.object.isRequired,
}
