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
        const { animeId, showRating, link, text, openInfoBox } = this.props
        const anime = Data.getAnime(animeId)

        // Element attributes depending on options
        let attributes = {}

        if (link) {
            attributes.title = 'View'
            attributes.onClick = () => openInfoBox(anime.id)
        }

        // CSS classes for the pill depending on options
        let pillClasses = ClassNames('status-pill', `status-pill-${Data.lookup.statusColor[anime.status]}`, {
            'status-pill-link': link,
        })

        // Text of the pill - show episode progress if status is "watching"
        let statusPillText = text || Data.lookup.status[anime.status]

        if (anime.status === 1) {
            statusPillText = <Fragment>{Data.lookup.status[anime.status]} &ndash; {anime.watchedEpisodes}/{anime.episodes}</Fragment>
        }

        return (
            <span className={pillClasses} {...attributes}>
                {statusPillText}{(showRating && !!anime.rating) && <Fragment> &ndash; Rated {anime.rating}</Fragment>}
            </span>
        )
    }
}