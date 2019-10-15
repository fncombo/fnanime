// React
import React, { useState, useRef } from 'react'

// Libraries
import has from 'has'
import classNames from 'classnames'
import { useInView } from 'react-intersection-observer'

// Style
import 'scss/Gallery.scss'

// Data
import { FILTERS } from 'js/data/Filters'

// Components
import ModalContainer from 'js/components/modal/ModalContainer'
import Favorite from 'js/components/Favorite'

// Width of the gallery item
const ITEM_WIDTH = 165

// Dimensions of the gallery images
const IMG_WIDTH = 145
const IMG_HEIGHT = IMG_WIDTH * 1.4

// Offset of when to start showing the component and images offscreen
const ROOT_MARGIN = '300px'

// Intersection options for the gallery item
const GALLERY_ITEM_OPTIONS = {
    rootMargin: ROOT_MARGIN,
    triggerOnce: true,
}

/**
 * Gallery item for a single anime including the image, type, status, and favorite icon.
 */
function GalleryItem(anime) {
    const [ hoverClass, setHoverClass ] = useState('')
    const [ tooltipStyle, setTooltipStyle ] = useState({})
    const [ itemRef, inView ] = useInView(GALLERY_ITEM_OPTIONS)
    const tooltipRef = useRef(null)

    // Do not render until the item is close to being visible to the user
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
        if (itemBounds.x <= (ITEM_WIDTH / 4)) {
            setHoverClass('is-left')

            style.left = currentTarget.offsetLeft

        // Close to the right
        } else if (itemBounds.x + ITEM_WIDTH + (ITEM_WIDTH / 8) >= window.innerWidth) {
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
    const { title, img, url, episodes, type, size, status, favorite } = anime
    const classes = classNames('gallery-item', hoverClass, {
        'is-not-downloaded': !size,
    })

    return (
        <ModalContainer anime={anime} className={classes} href={url} target="_blank" rel={rel} onMouseOver={hover}>
            <div className="gallery-item-inner" ref={itemRef}>
                <img width={IMG_WIDTH} height={IMG_HEIGHT} src={img} alt={title} loading="lazy" />
                <span className={`tag is-medium is-${FILTERS.status.colorCodes[status]}`}>
                    {episodes > 1
                        ? <>{FILTERS.type.descriptions[type]} &ndash; {episodes} ep</>
                        : FILTERS.type.descriptions[type]
                    }
                </span>
                <Favorite showHash>
                    {favorite}
                </Favorite>
            </div>
            <div className="gallery-item-tooltip" style={tooltipStyle} ref={tooltipRef}>
                {title}
            </div>
        </ModalContainer>
    )
}

export default GalleryItem
