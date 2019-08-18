// React
import React, { useContext } from 'react'

// Libraries
import classNames from 'classnames'

// Style
import '../../css/Badge.css'

// Data
import { ModalState } from '../data/GlobalState'
import { Filters } from '../data/Filters'

/**
 * A badge for an anime display the watch status with episode count if watching. Optionally can display
 * the anime rating and link to open an anime's info box.
 */
function Badge({ showRating, isLink, ...anime }) {
    // Anime wasn't found
    if (!anime) {
        return null
    }

    const classes = classNames('badge', 'p-2', `badge-${Filters.status.colorCodes[anime.status]}`, {
        btn: isLink,
        [`btn-${Filters.status.colorCodes[anime.status]}`]: isLink,
        'text-truncate': !isLink,
    })

    let text = Filters.status.descriptions[anime.status]

    // Show episode progress if number of watched episodes is different from total and not zero
    if ((anime.episodesWatched !== 0 && anime.episodesWatched !== anime.episodes) || anime.status === 1) {
        text = <>{text} &ndash; {anime.episodesWatched}/{anime.episodes || '?'}</>
    }

    // Optionally show anime rating
    if (showRating && !!anime.rating) {
        text = <>{text} &ndash; Rated {anime.rating}</>
    }

    // Open info box if a link
    if (isLink) {
        return (
            <LinkBadge anime={anime} className={classes}>
                {text}
            </LinkBadge>
        )
    }

    return <span className={classes}>{text}</span>
}

/**
 * Badge which change the current modal anime on click.
 */
function LinkBadge({ anime, children, ...rest }) {
    const { changeAnime } = useContext(ModalState)

    return (
        <span title="View" onClick={() => changeAnime(anime)} {...rest}>
            {children}
        </span>
    )
}

// Exports
export default Badge
