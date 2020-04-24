import React, { useContext } from 'react'
import PropTypes from 'prop-types'

import { FILTERS } from 'src/data/filters'
import { GlobalState } from 'src/data/global-state'

import GalleryHeading from 'src/components/gallery/GalleryHeading'
import GalleryItem from 'src/components/gallery/GalleryItem'

import 'src/styles/Gallery.scss'

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
        <div className="gallery-section" key={rating}>
            <GalleryHeading>{FILTERS.rating.descriptions[rating]}</GalleryHeading>
            {ratingDetailedDescription && <p className="gallery-detailed-description">{ratingDetailedDescription}</p>}
            <div className="gallery-grid">
                {galleryAnime.map((anime) => (
                    <GalleryItem key={anime.id} anime={anime} />
                ))}
            </div>
        </div>
    )
}

GallerySection.propTypes = {
    rating: PropTypes.number,
}
