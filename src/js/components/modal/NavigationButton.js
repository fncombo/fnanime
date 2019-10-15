// React
import React, { useContext } from 'react'

// Libraries
import classNames from 'classnames'

// Data
import { GlobalState, ACTIONS } from 'js/data/GlobalState'
import { FILTERS } from 'js/data/Filters'

// Helpers
import { getAdjacentAnime } from 'js/helpers/Modal'

// Components
import Icon from 'js/components/Icon'

/**
 * Previous and next buttons around the modal to quickly switch between adjacent anime.
 */
function NavigationButton({ direction, changeAnime, currentAnimeId }) {
    const { state: { anime: allAnime } } = useContext(GlobalState)

    // Get data about the adjacent anime
    const navAnime = getAdjacentAnime(allAnime, currentAnimeId, direction)

    const classes = classNames('modal-nav', `has-text-${FILTERS.status.colorCodes[navAnime.status]}`, {
        'is-placeholder': !navAnime,
        'is-next': direction === ACTIONS.NEXT_ANIME,
        'is-prev': direction !== ACTIONS.NEXT_ANIME,
    })

    // If no adjacent anime was found (e.g. this is the first or last anime already), then only display a placeholder
    if (!navAnime) {
        return <div className={classes} />
    }

    // Callback to change the modal anime when clicking on the button
    const onClick = () => {
        changeAnime(navAnime)
    }

    // The icon to use based on whether this is the previous/next button
    const icon = direction === ACTIONS.NEXT_ANIME ? 'chevron-right' : 'chevron-left'

    return (
        <div className={classes} title={navAnime.title} onClick={onClick}>
            <Icon icon={icon} className="is-medium" size="2x" />
            <img width="74" height="100" className="rounded" src={navAnime.img} alt={navAnime.title} />
        </div>
    )
}

export default NavigationButton
