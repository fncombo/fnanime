import React from 'react'

import { useInView } from 'react-intersection-observer'

import GallerySection from 'src/components/gallery/GallerySection'

import 'src/styles/Gallery.scss'

/**
 * Gallery for each rating which has matching anime.
 */
export default function Gallery() {
    const [ref, inView] = useInView({ rootMargin: '300px' })

    // Optimise to not render if not in view
    if (!inView) {
        return <div className="gallery-placeholder" ref={ref} />
    }

    // Make a section for each rating from 10 to 1, use the 0 index as null for "non-planned and non-rated anime"
    return (
        <div className="gallery" ref={ref}>
            {Array.from({ length: 11 }, (_, index) => <GallerySection rating={index || null} key={index} />).reverse()}
        </div>
    )
}
