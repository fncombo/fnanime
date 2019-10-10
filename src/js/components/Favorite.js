// React
import React from 'react'

// Style
import 'scss/Favorite.scss'

// Helpers
import Icon from 'js/helpers/Icon'

function Favorite({ number }) {
    return (
        <Icon
            icon="heart"
            className="is-favorite"
            title={`#${number} Favourite anime. These don't have to be rated 10, they are special regardless.`}
        >
            <span class="favorite-number">{number}</span>
        </Icon>
    )
}

export default Favorite
