// React
import React, { useContext } from 'react'

// Style
import '../../scss/Badge.scss'

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

    const classes = `tag is-medium is-rounded is-${Filters.status.colorCodes[anime.status]}`
    let extraInfo

    // Show episode progress if number of watched episodes is different from total and not zero
    if ((anime.episodesWatched !== 0 && anime.episodesWatched !== anime.episodes) || anime.status === 1) {
        extraInfo = <>{anime.episodesWatched}/{anime.episodes || '?'}</>
    }

    // Optionally show anime rating
    if (showRating && !!anime.rating) {
        extraInfo = <>Rated {anime.rating}</>
    }

    // Open info box if a link
    if (isLink) {
        return (
            <LinkBadge anime={anime} className={classes}>
                {Filters.status.descriptions[anime.status]}
            </LinkBadge>
        )
    }

    if (extraInfo) {
        return (
            <div className="tags has-addons">
                <span class={classes}>
                    {Filters.status.descriptions[anime.status]}
                </span>
                <span class='tag is-medium is-rounded is-dark'>
                    {extraInfo}
                </span>
            </div>
        )
    }

    return (
        <span className={classes}>
            {Filters.status.descriptions[anime.status]}
        </span>
    )
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
