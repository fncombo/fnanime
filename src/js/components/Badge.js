// React
import React from 'react'

// Libraries
import classNames from 'classnames'

// Style
import '../../scss/Badge.scss'

// Data
import { Filters } from '../data/Filters'

/**
 * A badge for an anime display the watch status with episode count if watching. Optionally can display
 * the anime rating and link to open an anime's info box.
 */
function Badge({ showRating, isSmall, onClick, ...anime }) {
    // Anime wasn't found
    if (!anime) {
        return null
    }

    let extraInfo
    let attributes = {}
    const classes = classNames(
        'tag is-rounded',
        isSmall ? 'is-normal' : 'is-medium',
        `is-${Filters.status.colorCodes[anime.status]}`,
    )

    // Show episode progress if number of watched episodes is different from total and not zero
    if ((anime.episodesWatched !== 0 && anime.episodesWatched !== anime.episodes) || anime.status === 1) {
        extraInfo = <>{anime.episodesWatched}&nbsp;&frasl;&nbsp;{anime.episodes || '?'}</>
    }

    // Optionally show anime rating
    if (showRating && !!anime.rating) {
        extraInfo = <>Rated {anime.rating}</>
    }

    // Open info box if a link
    if (onClick) {
        attributes = {
            title: 'View',
            onClick,
        }
    }

    if (extraInfo) {
        const mainClasses = classNames('tags has-addons', {
            'is-link': onClick,
        })
        const extraClasses = classNames('tag is-rounded is-dark', isSmall ? 'is-normal' : 'is-medium')

        return (
            <div className={mainClasses} {...attributes}>
                <span className={classes}>
                    {Filters.status.fancyDescriptions[anime.status]}
                </span>
                <span className={extraClasses}>
                    {extraInfo}
                </span>
            </div>
        )
    }

    return (
        <span className={classes} {...attributes}>
            {Filters.status.fancyDescriptions[anime.status]}
        </span>
    )
}

// Exports
export default Badge
