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
function Favorite({ number, showHash = false }) {
    if (!number) {
        return null
    }

    const numberClasses = classNames('favorite-number', {
        'has-hash': showHash,
    })

    return (
        <Icon
            icon="heart"
            className="is-favorite"
            // eslint-disable-next-line max-len
            title={`Favourite anime #${number}.\n\nThis refers to the whole series in general, or a specific season of that series.\n\nThese don't have to be rated 10 because they are special regardless in their own way.`}
        >
            <span className={numberClasses}>
                {showHash && '#'}{number}
            </span>
        </Icon>
    )
}

// Exports
export default Favorite
