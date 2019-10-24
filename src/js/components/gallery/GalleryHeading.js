// React
import React from 'react'

// Libraries
import classNames from 'classnames'

// Style
import 'scss/Gallery.scss'

// Components
import StuckSentinel from '../StuckSentinel'

/**
 * Gallery section heading which can become stuck.
 */
function GalleryHeading({ children: heading }) {
    return (
        <StuckSentinel className="gallery-heading-sentinel">
            {isStuck =>
                <h2 className={classNames('gallery-heading', { 'is-stuck': isStuck })}>
                    {heading}
                </h2>
            }
        </StuckSentinel>
    )
}

export default GalleryHeading
