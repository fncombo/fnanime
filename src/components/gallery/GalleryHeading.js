import React from 'react'

import classNames from 'classnames'

import 'src/styles/Gallery.scss'

import StuckSentinel from '../StuckSentinel'

/**
 * Gallery section heading which can become stuck.
 */
export default function GalleryHeading({ children: heading }) {
    return (
        <StuckSentinel className="gallery-heading-sentinel">
            {(isStuck) => <h2 className={classNames('gallery-heading', { 'is-stuck': isStuck })}>{heading}</h2>}
        </StuckSentinel>
    )
}
