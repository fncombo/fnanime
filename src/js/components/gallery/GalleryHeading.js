// React
import React from 'react'

// Libraries
import classNames from 'classnames'
import { useInView } from 'react-intersection-observer'

// Style
import 'scss/Gallery.scss'

/**
 * Gallery section heading which can become stuck.
 */
function GalleryHeading({ children: heading }) {
    const [ ref, inView, entry ] = useInView()

    // Check whether the heading is stuck to add additional styling
    const headerClasses = classNames('gallery-heading', {
        'is-stuck': !inView && entry,
    })

    return (
        <>
            <div className="gallery-heading-sentinel" ref={ref} />
            <h2 className={headerClasses}>
                <span>
                    {heading}
                </span>
            </h2>
        </>
    )
}

export default GalleryHeading
