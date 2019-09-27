// React
import React, { memo } from 'react'

// Libraries
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

// The start icon without having a million arrays for this every usage
const fasStar = [ 'fas', 'star' ]

/**
 * Wrapper around the FontAwesomeIcon component
 */
const Icon = memo(({ as: Element = 'span', icon, size = '1x', className, ...rest }) =>
    <Element className={className ? `icon ${className}` : 'icon'} {...rest}>
        <FontAwesomeIcon icon={icon} size={size} />
    </Element>
)

// Exports
export default Icon

export {
    fasStar,
}
