import React, { memo } from 'react'
import PropTypes from 'prop-types'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

/**
 * Wrapper around the FontAwesomeIcon component.
 */
function Icon({ as: Element = 'span', icon, size = '1x', className = null, children = null, ...rest }) {
    return (
        <Element className={className ? `icon ${className}` : 'icon'} {...rest}>
            <FontAwesomeIcon icon={icon} size={size} />
            {children}
        </Element>
    )
}

Icon.propTypes = {
    as: PropTypes.string,
    icon: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]).isRequired,
    size: PropTypes.string,
    className: PropTypes.string,
    children: PropTypes.node,
}

export default memo(Icon)
