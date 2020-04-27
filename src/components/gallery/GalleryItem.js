import React, { useCallback, useRef, useState } from 'react'

import classNames from 'classnames'
import { useInView } from 'react-intersection-observer'

import { FILTERS } from 'src/helpers/filters'
import { PROP_TYPES } from 'src/helpers/generic'

import Favorite from 'src/components/Favorite'
import ModalContainer from 'src/components/modal/ModalContainer'

// Width of the gallery item
const ITEM_WIDTH = 165

// Dimensions of the gallery images
const IMG_WIDTH = 145
const IMG_HEIGHT = IMG_WIDTH * 1.4

// Intersection options for the gallery item
const GALLERY_ITEM_OPTIONS = {
    rootMargin: '300px',
    triggerOnce: true,
}

/**
 * Gallery item for a single anime including the image, type, status, and favorite icon.
 */
export default function GalleryItem({ anime }) {
    const [hoverClass, setHoverClass] = useState('')
    const [tooltipStyle, setTooltipStyle] = useState({})
    const [itemRef, inView] = useInView(GALLERY_ITEM_OPTIONS)
    const tooltipRef = useRef(null)

    // Calculate whether the item is very close to the left or right edge to alter it's scaling on hover
    const hoverCallback = useCallback(
        ({ currentTarget }) => {
            const itemBounds = currentTarget.getBoundingClientRect()
            const gallerySectionBounds = currentTarget.parentNode.parentNode.getBoundingClientRect()
            const tooltipBounds = tooltipRef.current.getBoundingClientRect()
            const style = {
                bottom: gallerySectionBounds.height - currentTarget.offsetTop,
            }

            if (itemBounds.x <= ITEM_WIDTH / 4) {
                // Close to the left
                setHoverClass('is-left')

                style.left = currentTarget.offsetLeft
            } else if (itemBounds.x + ITEM_WIDTH + ITEM_WIDTH / 7 >= window.innerWidth) {
                // Close to the right
                setHoverClass('is-right')

                style.right = gallerySectionBounds.width - currentTarget.offsetLeft - itemBounds.width
            } else if (hoverClass.length) {
                // Reset previous class
                setHoverClass('')
            }

            if (!style.left && !style.right) {
                style.left = itemBounds.x - gallerySectionBounds.x + (itemBounds.width - tooltipBounds.width) / 2
            }

            setTooltipStyle(style)
        },
        [hoverClass.length]
    )

    // Do not render until the item is close to being visible to the user
    if (!inView) {
        return <div className="gallery-item-placeholder" ref={itemRef} />
    }

    const { title, img, episodes, type, size, status, favorite } = anime
    const classes = classNames('gallery-item', hoverClass, {
        'is-not-downloaded': !size,
    })

    return (
        <ModalContainer anime={anime} className={classes} onMouseOver={hoverCallback}>
            <div className="gallery-item-inner" ref={itemRef}>
                <img width={IMG_WIDTH} height={IMG_HEIGHT} src={img} alt={title} loading="lazy" />
                <span className={`tag is-medium is-${FILTERS.status.colorCodes[status]}`}>
                    {episodes > 1 ? (
                        <>
                            {FILTERS.type.descriptions[type]} &ndash; {episodes} ep
                        </>
                    ) : (
                        FILTERS.type.descriptions[type]
                    )}
                </span>
                <Favorite hasHash>{favorite}</Favorite>
            </div>
            <div className="gallery-item-tooltip" style={tooltipStyle} ref={tooltipRef}>
                {title}
            </div>
        </ModalContainer>
    )
}

GalleryItem.propTypes = {
    anime: PROP_TYPES.ANIME.isRequired,
}
