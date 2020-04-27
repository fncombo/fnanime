import React from 'react'
import PropTypes from 'prop-types'

import classNames from 'classnames'

import { FILTERS } from 'src/helpers/filters'
import { PROP_TYPES } from 'src/helpers/generic'

import 'src/styles/Badge.scss'

/**
 * A badge for an anime to display the watch status with episode count if watching. Optionally can display
 * the anime rating and link to open an anime's info box.
 */
export default function Badge({ hasRating = false, hasAirStatus = false, onClick = undefined, anime = null }) {
    // Anime wasn't found
    if (!anime) {
        return null
    }

    const { status, airStatus, rating, episodes, episodesWatched } = anime

    // Only show rating when the option is true and the anime is either watching, completed, on-hold, or dropped
    const includeRating = hasRating && status < 5

    // Only show air status when the option is true and anime is not completed and the air status has a description
    const includeAirStatus = hasAirStatus && airStatus !== 2 && FILTERS.airStatus.descriptions[airStatus]

    // Only show episodes when at least 1 and not all episodes have been watched, or the status is watching
    const includeEpisodes = ((episodesWatched !== 0 && episodesWatched !== episodes) || status === 1) && !includeRating

    // Make the badge small if the rating was asked for or air status is being included
    const isSmall = hasRating

    // Title if onClick was provided
    const title = onClick ? 'View' : undefined

    const classes = classNames(
        'tag is-rounded',
        isSmall ? 'is-normal' : 'is-medium',
        `is-${FILTERS.status.colorCodes[status]}`,
        {
            'is-modal-link': onClick,
        }
    )

    if (includeEpisodes || includeRating) {
        const mainClasses = classNames('tags has-addons', {
            'is-modal-link': onClick,
        })
        const extraClasses = classNames('tag is-rounded is-dark', isSmall ? 'is-normal' : 'is-medium', {
            'is-parted': includeEpisodes,
        })

        return (
            <div className={mainClasses} onClick={onClick} title={title}>
                <span className={classes}>
                    {FILTERS.status.fancyDescriptions[status]}
                    {includeAirStatus && `, ${FILTERS.airStatus.descriptions[airStatus]}`}
                </span>
                <span className={extraClasses}>
                    {includeEpisodes && (
                        <>
                            <span className={`tag-part is-current has-background-${FILTERS.status.colorCodes[status]}`}>
                                {episodesWatched}
                            </span>
                            <span className="tag-part is-total">{episodes || '?'}</span>
                        </>
                    )}
                    {includeRating && (rating ? `Rated ${rating}` : FILTERS.rating.tinyDescriptions.null)}
                </span>
            </div>
        )
    }

    return (
        <span className={classes} onClick={onClick} title={title}>
            {FILTERS.status.fancyDescriptions[status]}
            {includeAirStatus && `, ${FILTERS.airStatus.descriptions[airStatus]}`}
        </span>
    )
}

Badge.propTypes = {
    hasRating: PropTypes.bool,
    hasAirStatus: PropTypes.bool,
    onClick: PropTypes.func,
    anime: PROP_TYPES.ANIME,
}
