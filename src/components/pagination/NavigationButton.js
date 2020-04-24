import React, { useContext } from 'react'
import PropTypes from 'prop-types'

import classNames from 'classnames'

import { ACTIONS, TableState } from 'src/data/global-state'

import Icon from 'src/components/Icon'

import 'src/styles/Pagination.scss'

/**
 * Next and previous page button simply send an action type to the reducer.
 */
export default function NavigationButton({ action, isDisabled = false }) {
    const { dispatch } = useContext(TableState)

    /**
     * Callback to go to the next or previous page.
     */
    function changePageCallback() {
        dispatch({ type: action })
    }

    // Determine icon based on the button direction
    const icon = action === ACTIONS.PREV_PAGE ? 'chevron-left' : 'chevron-right'

    const classes = classNames(action === ACTIONS.PREV_PAGE ? 'is-left' : 'is-right', {
        'is-disabled': isDisabled,
    })

    return isDisabled ? (
        <Icon as="button" icon={icon} className={classes} />
    ) : (
        <Icon as="button" icon={icon} className={classes} onClick={changePageCallback} />
    )
}

NavigationButton.propTypes = {
    action: PropTypes.oneOf([ACTIONS.PREV_PAGE, ACTIONS.NEXT_PAGE]).isRequired,
    isDisabled: PropTypes.bool,
}
