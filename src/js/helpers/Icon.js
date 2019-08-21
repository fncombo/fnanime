// React
import React, { memo } from 'react'

// Libraries
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

// Wrapper around the FontAwesomeIcon component
const Icon = memo(({ icon, className, ...rest }) => {
    return (
        <span className={className ? `icon ${className}` : 'icon'} {...rest}>
            <FontAwesomeIcon icon={icon} />
        </span>
    )
})

export default Icon
