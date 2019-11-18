// React
import React from 'react'

// Libraries
import classNames from 'classnames'

// Style
import 'scss/Favorite.scss'

// Components
import Icon from 'js/components/Icon'

/**
 * Displays a heart icon with a number to denote a favorite anime.
 */
export default function Favorite({ showHash, children: number }) {
    if (!number) {
        return null
    }

    // eslint-disable-next-line max-len
    const title = `Favourite anime #${number}.\n\nThis refers to the whole series in general, or a specific season of that series.\n\nThese don't have to be rated 10 because they are special regardless in their own way.`

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
