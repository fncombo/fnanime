import React from 'react'
import PropTypes from 'prop-types'

import classNames from 'classnames'

import StuckSentinel from 'src/components/StuckSentinel'

import 'src/styles/Gallery.scss'

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

GalleryHeading.propTypes = {
    children: PropTypes.node.isRequired,
}
