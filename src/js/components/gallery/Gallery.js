// React
import React from 'react'

// Libraries
import { useInView } from 'react-intersection-observer'

// Style
import 'scss/Gallery.scss'

// Components
import GallerySection from 'js/components/gallery/GallerySection'

// Intersection options for the component and individual items
const GALLERY_OPTIONS = {
    rootMargin: '300px',
}

/**
 * Gallery for each rating which has matching anime.
 */
export default function Gallery() {
    const [ ref, inView ] = useInView(GALLERY_OPTIONS)

    // Optimise to not render if not in view
    if (!inView) {
        return <div className="gallery-placeholder" ref={ref} />
    }

    // Make a section for each rating from 10 to 1, use the 0 index as null for "non-planned and non-rated anime"
    return (
        <div className="gallery" ref={ref}>
            {Array.from({ length: 11 }, (value, index) =>
                <GallerySection rating={index || null} key={index} />
            ).reverse()}
        </div>
    )
}
