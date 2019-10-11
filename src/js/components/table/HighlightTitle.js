// React
import React from 'react'

// Libraries
import reactStringReplace from 'react-string-replace'

/**
 * Highlights an anime title with search results if they have been provided.
 */
function HighlightTitle({ highlight, children: title }) {
    if (!title) {
        return null
    }

    if (!highlight) {
        return title
    }

    // Get unique parts of the title to highlight, sorted from longest string to shortest string
    const parts = [ ...new Set(highlight.map(([ start, end ]) => title.slice(start, end + 1).toUpperCase())) ]
        .sort((a, b) => b.length - a.length)

    // Construct a simple regex to match the title parts
    const matches = RegExp(`(${parts.join('|')})`, 'gi')

    return reactStringReplace(title, matches, (match, i) =>
        <strong key={match + i}>
            {match}
        </strong>
    )
}

export default HighlightTitle
