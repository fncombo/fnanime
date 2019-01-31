// Libraries
import ClassNames from 'classnames'

// React
import React, { PureComponent, Fragment } from 'react'

// Style
import '../css/StatusPill.css'

// Components
import Data from './Data'

// Filters, search, and reset
export default class StatusPill extends PureComponent {
    render() {
        const { animeId, showRating, isLink, overrideText, openInfoBox } = this.props
        const anime = Data.getAnime(animeId)

        if (!anime) {
            return null
        }

        // All pill attributes depending on options
        let attributes = {
            className: ClassNames(
                'status-pill',
                `status-pill-${Data.lookup.statusColor[anime.status]}`,
                {
                    'status-pill-link': isLink,
                },
            ),
        }

        if (isLink) {
            attributes.title = 'View'
            attributes.onClick = () => openInfoBox(animeId)
        }

        // Text of the pill
        let statusPillText = overrideText || Data.lookup.status[anime.status]

        // Show episode progress if status is "watching"
        if (anime.status === 1) {
            statusPillText = <Fragment>{statusPillText} &ndash; {anime.episodesWatched}/{anime.episodes || '?'}</Fragment>
        }

        // Show anime rating if needed
        if (showRating && !!anime.rating) {
            statusPillText = <Fragment>{statusPillText} &ndash; Rated {anime.rating}</Fragment>
        }

        return <span {...attributes}>{statusPillText}</span>
    }
}