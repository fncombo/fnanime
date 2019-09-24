// React
import React, { useContext, useState, useRef } from 'react'

// Libraries
import has from 'has'
import classNames from 'classnames'
import { useInView } from 'react-intersection-observer'

// Style
import 'scss/Gallery.scss'

// Data
import { GlobalState } from 'js/data/GlobalState'
import { FILTERS } from 'js/data/Filters'

// Components
import ModalContainer from 'js/components/Modal'

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
    const [ ref, inView ] = useInView(galleryOptions)

    // Do not render and do all this calculating and creating hundreds of components if not in view
    if (!inView) {
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
                            {FILTERS.rating.descriptions[actualRating]}
                        </GalleryHeading>
                        <p className="gallery-detailed-description">
                            {FILTERS.rating.detailedDescriptions[actualRating]}
                        </p>
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
    const headerClasses = classNames('gallery-heading', {
        'is-stuck': !inView && entry,
    })

    return (
        <>
            <div className="gallery-heading-sentinel" ref={ref} />
            <h2 className={headerClasses}>
                <span>{children}</span>
            </h2>
        </>
    )
}

/**
 * Gallery item for a single item including the image, type, and status.
 */
function GalleryItem(anime) {
    const [ hoverClass, setHoverClass ] = useState('')
    const [ tooltipStyle, setTooltipStyle ] = useState({})
    const [ itemRef, inView ] = useInView(galleryItemOptions)
    const tooltipRef = useRef(null)

    // Do not render until the item is close to being visible to the user to prevent useless image loading
    if (!inView) {
        return <div className="gallery-item-placeholder" ref={itemRef} />
    }

    // Calculate whether the item is very close to the left or right edge to alter it's scaling on hover
    const hover = ({ currentTarget }) => {
        const itemBounds = currentTarget.getBoundingClientRect()
        const gallerySectionBounds = currentTarget.parentNode.parentNode.getBoundingClientRect()
        const tooltipBounds = tooltipRef.current.getBoundingClientRect()
        const style = {
            bottom: gallerySectionBounds.height - currentTarget.offsetTop,
        }

        // Close to the left
        if (itemBounds.x <= (imgWidth / 4)) {
            setHoverClass('is-left')

            style.left = currentTarget.offsetLeft

        // Close to the right
        } else if (itemBounds.x + imgWidth + (imgWidth / 8) >= window.innerWidth) {
            setHoverClass('is-right')

            style.right = gallerySectionBounds.width - currentTarget.offsetLeft - itemBounds.width

        // Reset previous class
        } else if (hoverClass.length) {
            setHoverClass('')
        }

        if (!has(style, 'left') && !has(style, 'right')) {
            style.left = itemBounds.x - gallerySectionBounds.x + ((itemBounds.width - tooltipBounds.width) / 2)
        }

        setTooltipStyle(style)
    }

    const rel = 'noopener noreferrer'
    const { title, img, url, episodes, type, size, status } = anime
    const classes = classNames('gallery-item', hoverClass, {
        'is-not-downloaded': !size,
    })

    return (
        <ModalContainer anime={anime} className={classes} href={url} target="_blank" rel={rel} onMouseOver={hover}>
            <div className="gallery-item-inner" ref={itemRef}>
                <img src={img} alt={title} />
                <span className={`tag is-medium is-${FILTERS.status.colorCodes[status]}`}>
                    {episodes > 1
                        ? <>{FILTERS.type.descriptions[type]} &ndash; {episodes} ep</>
                        : FILTERS.type.descriptions[type]
                    }
                </span>
            </div>
            <div className="gallery-item-tooltip" style={tooltipStyle} ref={tooltipRef}>{title}</div>
        </ModalContainer>
    )
}

// Exports
export default Gallery
