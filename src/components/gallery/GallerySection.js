import React, { useContext } from 'react'
import PropTypes from 'prop-types'

import classNames from 'classnames'

import { FILTERS } from 'src/helpers/filters'
import { GlobalState } from 'src/helpers/global-state'

import GalleryItem from 'src/components/gallery/GalleryItem'
import StuckSentinel from 'src/components/StuckSentinel'

/**
 * A section of gallery for a single rating. If there are no anime matching the rating, the section is skipped.
 */
export default function GallerySection({ rating }) {
    const {
        state: { anime: allAnime },
    } = useContext(GlobalState)

    const galleryAnime = allAnime.filter(({ rating: animeRating }) => animeRating === rating)

    // Don't create section if there are no anime for this rating
    if (!galleryAnime.length) {
        return null
    }

    const ratingDetailedDescription = FILTERS.rating.detailedDescriptions[rating]

    return (
        <div className="gallery-section">
            <StuckSentinel className="gallery-heading-sentinel">
                {(isStuck) => (
                    <h2 className={classNames('gallery-heading', { 'is-stuck': isStuck })}>
                        {FILTERS.rating.descriptions[rating]}
                    </h2>
                )}
            </StuckSentinel>
            {ratingDetailedDescription && <p className="gallery-detailed-description">{ratingDetailedDescription}</p>}
            <div className="gallery-grid">
                {galleryAnime.map((anime) => (
                    <GalleryItem anime={anime} key={anime.id} />
                ))}
            </div>
        </div>
    )
}

GallerySection.propTypes = {
    rating: PropTypes.number,
}
