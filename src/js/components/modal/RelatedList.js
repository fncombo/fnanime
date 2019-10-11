// React
import React, { Fragment } from 'react'

// Components
import RelatedListItem from 'js/components/modal/RelatedListItem'

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
            <strong>
                {type}
            </strong>
            <ul className="related-list">
                {allAnime.map(anime =>
                    <RelatedListItem {...anime} key={anime.mal_id} />
                )}
            </ul>
        </Fragment>
    )
}

// Exports
export default RelatedList
