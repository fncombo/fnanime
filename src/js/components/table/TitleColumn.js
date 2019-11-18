// React
import React from 'react'

// Data
import { TABLE_COLUMNS } from 'js/data/Table'
import { FILTERS } from 'js/data/Filters'

// Components
import Favorite from 'js/components/Favorite'
import HighlightTitle from 'js/components/table/HighlightTitle'

/**
 * Title column for an anime which contains the title and anime type together.
 * If the anime is a favorite, the favorite icon and number are included.
 * If a search query is present, it gets highlighted using the anime's status color.
 */
export default function TitleColumn({ title, status, type, favorite, highlight }) {
    // Styles for the column width on desktop and grid position on mobile
    const style = {
        flexBasis: TABLE_COLUMNS.title.size,
        gridArea: 'title',
    }

    return (
        <div className={`table-column is-title has-highlight-${FILTERS.status.colorCodes[status]}`} style={style}>
            <Favorite>
                {favorite}
            </Favorite>
            <span className="has-text-overflow" title={title}>
                <HighlightTitle highlight={highlight}>
                    {title}
                </HighlightTitle>
            </span>
            <span className="type">
                {FILTERS.type.descriptions[type]}
            </span>
        </div>
    )
}
