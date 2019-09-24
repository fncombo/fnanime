// React
import React from 'react'

// Libraries
import has from 'has'
import classNames from 'classnames'

// Style
import 'scss/Badge.scss'

// Data
import { FILTERS } from 'js/data/Filters'

/**
 * A badge for an anime display the watch status with episode count if watching. Optionally can display
 * the anime rating and link to open an anime's info box.
 */
function Badge({ showRating, isSmall, includeAirStatus, onClick, ...anime }) {
    // Anime wasn't found
    if (!anime) {
        return null
    }

    const showAirStatus = includeAirStatus
        ? anime.airStatus !== 2 && has(FILTERS.airStatus.descriptions, anime.airStatus)
        : false

    const isSmallClass = isSmall || showAirStatus

    let extraInfo
    let attributes = {}
    let showEpisodes = (anime.episodesWatched !== 0 && anime.episodesWatched !== anime.episodes) || anime.status === 1

    const classes = classNames(
        'tag is-rounded',
        isSmallClass ? 'is-normal' : 'is-medium',
        `is-${FILTERS.status.colorCodes[anime.status]}`,
    )

    // Show episode progress if number of watched episodes is different from total and not zero
    if (showEpisodes) {
        extraInfo = <>
            <span className={`tag-part is-current has-background-${FILTERS.status.colorCodes[anime.status]}`}>
                {anime.episodesWatched}
            </span>
            <span className="tag-part is-total">{anime.episodes || '?'}</span>
        </>
    }

    // Optionally show anime rating
    if (showRating && !!anime.rating) {
        // In which case, no longer show episodes
        showEpisodes = false

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
        const extraClasses = classNames('tag is-rounded is-dark', isSmallClass ? 'is-normal' : 'is-medium', {
            'is-parted': showEpisodes,
        })

        return (
            <div className={mainClasses} {...attributes}>
                <span className={classes}>
                    {FILTERS.status.fancyDescriptions[anime.status]}
                    {showAirStatus && `, ${FILTERS.airStatus.descriptions[anime.airStatus]}`}
                </span>
                <span className={extraClasses}>
                    {extraInfo}
                </span>
            </div>
        )
    }

    return (
        <span className={classes} {...attributes}>
            {FILTERS.status.fancyDescriptions[anime.status]}
            {showAirStatus && `, ${FILTERS.airStatus.descriptions[anime.airStatus]}`}
        </span>
    )
}

// Exports
export default Badge
