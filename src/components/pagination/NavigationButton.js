import React, { useContext } from 'react'

import classNames from 'classnames'

import 'src/styles/Pagination.scss'

import { TableState, ACTIONS } from 'src/data/GlobalState'

import Icon from 'src/components/Icon'

/**
 * Next and previous page button simply send an action type to the reducer.
 */
export default function NavigationButton({ action: type, disabled }) {
    const { dispatch } = useContext(TableState)

    // Callback to go to the next or previous page
    function changePageCallback() {
        dispatch({ type })
    }

    // Determine icon based on the button direction
    const icon = type === ACTIONS.PREV_PAGE ? 'chevron-left' : 'chevron-right'

    const classes = classNames(type === ACTIONS.PREV_PAGE ? 'is-left' : 'is-right', {
        'is-disabled': disabled,
    })

    return disabled ? (
        <Icon as="button" icon={icon} className={classes} />
    ) : (
        <Icon as="button" icon={icon} className={classes} onClick={changePageCallback} />
    )
}
