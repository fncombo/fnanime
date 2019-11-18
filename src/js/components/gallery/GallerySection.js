// React
import React, { useContext } from 'react'

// Style
import 'scss/Gallery.scss'

// Data
import { GlobalState } from 'js/data/GlobalState'
import { FILTERS } from 'js/data/Filters'

// Components
import GalleryHeading from 'js/components/gallery/GalleryHeading'
import GalleryItem from 'js/components/gallery/GalleryItem'

/**
 * A section of gallery for a single rating. If there are no anime matching the rating, the section is skipped.
 */
export default function GallerySection({ rating }) {
    const { state: { anime: allAnime } } = useContext(GlobalState)

    const galleryAnime = allAnime.filter(({ rating: animeRating }) => animeRating === rating)

    // Don't create section if there are no anime for this rating
    if (!galleryAnime.length) {
        return null
    }

    const ratingDetailedDescription = FILTERS.rating.detailedDescriptions[rating]

    return (
        <div className="gallery-section" key={rating}>
            <GalleryHeading>
                {FILTERS.rating.descriptions[rating]}
            </GalleryHeading>
            {ratingDetailedDescription &&
                <p className="gallery-detailed-description">
                    {ratingDetailedDescription}
                </p>
            }
            <div className="gallery-grid">
                {galleryAnime.map(anime =>
                    <GalleryItem key={anime.id} {...anime} />
                )}
            </div>
        </div>
    )
}
