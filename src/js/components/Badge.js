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
 * A badge for an anime to display the watch status with episode count if watching. Optionally can display
 * the anime rating and link to open an anime's info box.
 */
function Badge({ showRating, showAirStatus, onClick, ...anime }) {
    // Anime wasn't found
    if (!anime) {
        return null
    }

    const { status, airStatus, rating, episodes, episodesWatched } = anime

    // Only show rating when the option is true and the anime is either watching, completed, on-hold, or dropped
    const includeRating = showRating && status < 5

    // Only show air status when the option is true and anime is not completed and the air status has a description
    const includeAirStatus = showAirStatus && airStatus !== 2 && has(FILTERS.airStatus.descriptions, airStatus)

    // Only show episodes when at least 1 and not all episodes have been watched, or the status is watching
    const includeEpisodes = ((episodesWatched !== 0 && episodesWatched !== episodes) || status === 1) && !includeRating

    // Make the badge small if the rating was asked for or air status is being included
    const isSmall = showRating

    // Title and onClick handler attributes if onClick was provided
    const attributes = onClick ? {
        title: 'View',
        onClick,
    } : {}

    const classes = classNames(
        'tag is-rounded',
        isSmall ? 'is-normal' : 'is-medium',
        `is-${FILTERS.status.colorCodes[status]}`, {
            'is-modal-link': onClick,
        })

    if (includeEpisodes || includeRating) {
        const mainClasses = classNames('tags has-addons', {
            'is-modal-link': onClick,
        })
        const extraClasses = classNames('tag is-rounded is-dark', isSmall ? 'is-normal' : 'is-medium', {
            'is-parted': includeEpisodes,
        })

        return (
            <div className={mainClasses} {...attributes}>
                <span className={classes}>
                    {FILTERS.status.fancyDescriptions[status]}
                    {includeAirStatus && `, ${FILTERS.airStatus.descriptions[airStatus]}`}
                </span>
                <span className={extraClasses}>
                    {includeEpisodes &&
                        <>
                            <span className={`tag-part is-current has-background-${FILTERS.status.colorCodes[status]}`}>
                                {episodesWatched}
                            </span>
                            <span className="tag-part is-total">
                                {episodes || '?'}
                            </span>
                        </>
                    }
                    {includeRating && (rating ? `Rated ${rating}` : FILTERS.rating.tinyDescriptions.null)}
                </span>
            </div>
        )
    }

    return (
        <span className={classes} {...attributes}>
            {FILTERS.status.fancyDescriptions[status]}
            {includeAirStatus && `, ${FILTERS.airStatus.descriptions[airStatus]}`}
        </span>
    )
}

// Exports
export default Badge
