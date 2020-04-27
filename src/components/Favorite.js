import React from 'react'
import PropTypes from 'prop-types'

import classNames from 'classnames'

import { formatOrdinal } from 'src/helpers/generic'

import Icon from 'src/components/Icon'

import 'src/styles/Favorite.scss'

/**
 * Displays a heart icon with a number to denote a favorite anime.
 */
export default function Favorite({ hasHash = false, children: number }) {
    if (!number) {
        return null
    }

    const title = `${number}${formatOrdinal(number)} favourite anime (also refers to the whole series in general)`

    const numberClasses = classNames('favorite-number', {
        'has-hash': hasHash,
    })

    return (
        <Icon icon="heart" className="is-favorite" title={title}>
            <span className={numberClasses}>
                {hasHash && '#'}
                {number}
            </span>
        </Icon>
    )
}

Favorite.propTypes = {
    hasHash: PropTypes.bool,
    children: PropTypes.oneOfType([PropTypes.number, PropTypes.bool]).isRequired,
}
