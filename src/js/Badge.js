// React
import React, { PureComponent, Fragment } from 'react'

// Style
import '../css/Badge.css'

// Components
import Data from './Data'

export default class Badge extends PureComponent {
    render() {
        const { animeId, showRating, isLink, openInfoBox } = this.props

        const anime = Data.getAnime(animeId)

        if (!anime) {
            return null
        }

        const classes = `badge p-2 badge-${Data.filters.status.colorCodes[anime.status]} text-truncate`

        let text = Data.filters.status.descriptions[anime.status]

        // Show episode progress if status is "watching"
        if (anime.status === 1) {
            text = <Fragment>{text} &ndash; {anime.episodesWatched}/{anime.episodes || '?'}</Fragment>
        }

        // Show anime rating
        if (showRating && !!anime.rating) {
            text = <Fragment>{text} &ndash; Rated {anime.rating}</Fragment>
        }

        if (isLink) {
            return <span className={`${classes} btn btn-${Data.filters.status.colorCodes[anime.status]} `} title="View" onClick={() => openInfoBox(animeId)}>{text}</span>
        }

        return <span className={classes}>{text}</span>
    }
}
