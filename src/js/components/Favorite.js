// React
import React from 'react'

// Libraries
import classNames from 'classnames'

// Style
import 'scss/Favorite.scss'

// Components
import Icon from 'js/components/Icon'
import { formatOrdinal } from 'js/helpers/Table'

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
