import React, { FunctionComponent, ReactNode } from 'react'

import { InView } from 'react-intersection-observer'
import styled from 'styled-components'

const Sentinel = styled.div`
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    height: 1px;
`

/**
 * Creates a sentinel element which tracks whether the content is stuck based on whether the sentinel element
 * is on the screen or not.
 */
const StuckSentinel: FunctionComponent<{
    children: (isStuck: boolean) => ReactNode
}> = ({ children }) => (
    <InView>
        {({ ref, inView, entry }) => (
            <>
                <Sentinel ref={ref} />
                {children(!inView && !!entry)}
            </>
        )}
    </InView>
)

export default StuckSentinel
