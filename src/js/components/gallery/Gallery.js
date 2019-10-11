// React
import React, { useContext } from 'react'

// Libraries
import { useInView } from 'react-intersection-observer'

// Style
import 'scss/Gallery.scss'

// Data
import { GlobalState } from 'js/data/GlobalState'
import { FILTERS } from 'js/data/Filters'

// Components
import GalleryHeading from 'js/components/gallery/GalleryHeading'
import GalleryItem from 'js/components/gallery/GalleryItem'

// Offset of when to start showing the component and images offscreen
const ROOT_MARGIN = '300px'

// Intersection options for the component and individual items
const GALLERY_OPTIONS = { rootMargin: ROOT_MARGIN }

/**
 * Gallery for each rating which has matching anime.
 */
function Gallery() {
    const { state: { anime: allAnime } } = useContext(GlobalState)
    const [ ref, inView ] = useInView(GALLERY_OPTIONS)

    // Do not render and do all this calculating and creating hundreds of components if not in view
    if (!inView) {
        return <div className="gallery-placeholder" ref={ref} />
    }

    // Count how many there are anime for each rating, if the rating is null (not planned, not rated), use 0,
    // if the rating is false (planned, not rated), skip that anime
    const ratingCounts = Array(11).fill(0)

    for (const { rating } of allAnime) {
        if (rating === false) {
            continue
        }

        ratingCounts[rating || 0] += 1
    }

    // Only show ratings which have anime and exclude all non-rated anime
    return (
        <div className="gallery" ref={ref}>
            {ratingCounts.map((count, rating) => {
                // No anime found for this rating, skip it
                if (!count) {
                    return null
                }

                // If the rating is 0, use null to find non-planned anime without ratings
                return (
                    <div className="gallery-section" key={rating}>
                        <GalleryHeading>
                            {FILTERS.rating.descriptions[rating]}
                        </GalleryHeading>
                        <p className="gallery-detailed-description">
                            {FILTERS.rating.detailedDescriptions[rating]}
                        </p>
                        <div className="gallery-grid">
                            {allAnime.filter(({ rating: animeRating }) => animeRating === (rating || null)).map(anime =>
                                <GalleryItem key={anime.id} {...anime} />
                            )}
                        </div>
                    </div>
                )
            }).reverse()}
        </div>
    )
}

// Exports
export default Gallery
