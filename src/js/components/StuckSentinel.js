// React
import React from 'react'

// Libraries
import { useInView } from 'react-intersection-observer'

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
