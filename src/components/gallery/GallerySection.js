import React, { useContext } from 'react'

import 'src/styles/Gallery.scss'

import { GlobalState } from 'src/data/GlobalState'
import { FILTERS } from 'src/data/Filters'

import GalleryHeading from 'src/components/gallery/GalleryHeading'
import GalleryItem from 'src/components/gallery/GalleryItem'

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
                    <GalleryItem key={anime.id} {...anime} />
                ))}
            </div>
        </div>
    )
}
