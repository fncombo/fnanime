// React
import React from 'react'

// Libraries
import { useInView } from 'react-intersection-observer'

/**
 * Creates a sentinel element which tracks whether the content is stuck based on whether the sentinel element
 * is on screen or not. Relies on CSS to correctly position the sentinel element and other elements.
 */
function StuckSentinel({ className, children }) {
    const [ ref, inView, entry ] = useInView()

    // Check whether the children are stuck
    const isStuck = !inView && entry

    return (
        <>
            <div className={className} ref={ref} />
            {children(isStuck)}
        </>
    )
}

export default StuckSentinel
