// React
import React from 'react'

// Style
import 'scss/Favorite.scss'

// Components
import Icon from 'js/components/Icon'

function Favorite({ number }) {
    return (
        <Icon
            icon="heart"
            className="is-favorite"
            // eslint-disable-next-line max-len
            title={`Favourite anime #${number}.\n\nThis refers to the whole series in general, or a specific season of that series.\n\nThese don't have to be rated 10 because they are special regardless in their own way.`}
        >
            <span class="favorite-number">{number}</span>
        </Icon>
    )
}

export default Favorite
