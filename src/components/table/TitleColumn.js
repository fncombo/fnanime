import React from 'react'

import { FILTERS } from 'src/helpers/filters'
import { PROP_TYPES } from 'src/helpers/generic'
import { TABLE_COLUMNS } from 'src/helpers/table'

import Favorite from 'src/components/Favorite'
import HighlightTitle from 'src/components/table/HighlightTitle'

/**
 * Title column for an anime which contains the title and anime type together.
 * If the anime is a favorite, the favorite icon and number are included.
 * If a search query is present, it gets highlighted using the anime's status color.
 */
export default function TitleColumn({ anime: { title, status, type, favorite, highlight } }) {
    // Styles for the column width on desktop and grid position on mobile
    const style = {
        flexBasis: TABLE_COLUMNS.title.size,
        gridArea: 'title',
    }

    return (
        <div className={`table-column is-title has-highlight-${FILTERS.status.colorCodes[status]}`} style={style}>
            <Favorite>{favorite}</Favorite>
            <span className="has-text-overflow" title={title}>
                <HighlightTitle highlight={highlight}>{title}</HighlightTitle>
            </span>
            <span className="type">{FILTERS.type.descriptions[type]}</span>
        </div>
    )
}

TitleColumn.propTypes = {
    anime: PROP_TYPES.ANIME.isRequired,
}
