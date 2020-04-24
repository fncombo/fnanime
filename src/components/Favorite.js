import React from 'react'

import classNames from 'classnames'

import 'src/styles/Favorite.scss'

import { formatOrdinal } from 'src/helpers/Generic'

import Icon from 'src/components/Icon'

/**
 * Displays a heart icon with a number to denote a favorite anime.
 */
export default function Favorite({ showHash, children: number }) {
    if (!number) {
        return null
    }

    const title = `${number}${formatOrdinal(number)} favourite anime (also refers to the whole series in general)`

    const numberClasses = classNames('favorite-number', {
        'has-hash': showHash,
    })

    return (
        <Icon icon="heart" className="is-favorite" title={title}>
            <span className={numberClasses}>
                {showHash && '#'}
                {number}
            </span>
        </Icon>
    )
}
