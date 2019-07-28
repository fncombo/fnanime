// React
import React, { useContext } from 'react'

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

    const classes = `badge p-2 text-truncate badge-${Filters.status.colorCodes[anime.status]}`

    let text = Filters.status.descriptions[anime.status]

    // Show episode progress if status is "watching"
    if (anime.status === 1) {
        text = <>{text} &ndash; {anime.episodesWatched}/{anime.episodes || '?'}</>
    }

    // Optionally show anime rating
    if (showRating && !!anime.rating) {
        text = <>{text} &ndash; Rated {anime.rating}</>
    }

    // Open info box if a link
    if (isLink) {
        return (
            <LinkBadge anime={anime} className={`${classes} btn btn-${Filters.status.colorCodes[anime.status]}`}>
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
