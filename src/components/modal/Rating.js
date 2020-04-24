import React from 'react'
import PropTypes from 'prop-types'

import { FILTERS } from 'src/data/filters'

import Icon from 'src/components/Icon'

/**
 * Displays anime's rating using stars. Always shows 10 stars with different style for rating and filler.
 * Defaults to "not rated" description for falsy ratings.
 */
export default function Rating({ children: rating }) {
    return (
        <>
            <div className="rating">
                <span className="has-text-warning">
                    {Array.from({ length: rating }, (_, i) => (
                        <Icon icon={['fas', 'star']} key={i} />
                    ))}
                </span>
                <span className="has-text-grey-light">
                    {Array.from({ length: 10 - rating }, (_, i) => (
                        <Icon icon={['far', 'star']} key={i} />
                    ))}
                </span>
            </div>
            <h5 className="title is-5">
                {FILTERS.rating.simpleDescriptions[rating || null]}
                {!!rating && <> &ndash; {rating}</>}
            </h5>
        </>
    )
}

Rating.propTypes = {
    children: PropTypes.number.isRequired,
}
