// React
import React, { useContext, useState } from 'react'

// Libraries
import classNames from 'classnames'
import { useInView } from 'react-intersection-observer'

// Style
import '../../scss/Gallery.scss'

// Data
import { GlobalState } from '../data/GlobalState'
import { Filters } from '../data/Filters'

// Components
import ModalContainer from './Modal'

// Width of the gallery item
const imgWidth = 165

// Offset of when to start showing the component and images offscreen
const rootMargin = '300px'

// Intersection options for the component and individual items
const galleryOptions = { rootMargin }

const galleryItemOptions = {
    rootMargin,
    triggerOnce: true,
}

/**
 * Gallery for each rating which has matching anime.
 */
function Gallery() {
    const { state: { anime } } = useContext(GlobalState)
    const [ ref, inView, entry ] = useInView(galleryOptions)

    // Do not render and do all this calculating and creating hundreds of components if not in view
    if (!inView && entry && entry.boundingClientRect.y >= 0) {
        return <div className="gallery-placeholder" ref={ref} />
    }

    // Count how many there are anime for each rating
    const ratingCounts = Array(11).fill(0)

    for (const { rating } of anime) {
        ratingCounts[rating] += 1
    }

    // Only show ratings which have anime and exclude all non-rated anime
    return (
        <div className="gallery" ref={ref}>
            {ratingCounts.slice(1).reverse().map((count, rating) => {
                if (!count) {
                    return null
                }

                const actualRating = 10 - rating

                return (
                    <div className="gallery-section" key={actualRating}>
                        <GalleryHeading>
                            {Filters.rating.descriptions[actualRating]}
                        </GalleryHeading>
                        <div className="gallery-grid">
                            {anime.filter(({ rating: animeRating }) => animeRating === actualRating).map(cartoon =>
                                <GalleryItem key={cartoon.id} {...cartoon} />
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

/**
 * Gallery section heading which can become stuck.
 */
function GalleryHeading({ children }) {
    const [ ref, inView, entry ] = useInView()

    // Check whether the heading is stuck to add additional styling
    const headerClasses = classNames('gallery-heading title is-3', {
        'is-stuck': !inView && entry,
    })

    return (
        <>
            <div className="gallery-heading-sentinel" ref={ref} />
            <h2 className={headerClasses}>
                {children}
            </h2>
        </>
    )
}

/**
 * Gallery item for a single item including the image, type, and status.
 */
function GalleryItem(anime) {
    const [ hoverClass, setHoverClass ] = useState('')
    const [ ref, inView, entry ] = useInView(galleryItemOptions)

    // Calculate whether the item is very close to the left or right edge to alter it's scaling on hover
    const hover = ({ currentTarget }) => {
        const bounds = currentTarget.getBoundingClientRect()

        // Close to the left
        if (bounds.x <= (imgWidth / 4)) {
            setHoverClass('is-left')

        // Close to the right
        } else if (bounds.x + imgWidth + (imgWidth / 4) >= window.innerWidth) {
            setHoverClass('is-right')

        // Reset previous class
        } else if (hoverClass.length) {
            setHoverClass('')
        }
    }

    // Do not render until the item is close to being visible to the user to prevent useless image loading
    if (!inView && entry && entry.boundingClientRect.y >= 0) {
        return <div className="gallery-item-placeholder" ref={ref} />
    }

    const rel = 'noopener noreferrer'
    const { title, img, url, episodes, type, size, status } = anime
    const classes = classNames('gallery-item', hoverClass, {
        'is-not-downloaded': !size,
    })

    return (
        <ModalContainer anime={anime} className={classes} href={url} target="_blank" rel={rel} onMouseOver={hover}>
            <div className="gallery-item-inner" ref={ref}>
                <img src={img} alt={title} />
                <span className={`tag is-medium is-${Filters.status.colorCodes[status]}`}>
                    {episodes > 1
                        ? <>{Filters.type.descriptions[type]} &ndash; {episodes} ep</>
                        : Filters.type.descriptions[type]
                    }
                </span>
            </div>
        </ModalContainer>
    )
}

// Exports
export default Gallery
