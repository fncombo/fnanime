// React
import React, { useContext } from 'react'

// Libraries
import classNames from 'classnames'

// Style
import 'scss/Pagination.scss'

// Data
import { TableState, ACTIONS } from 'js/data/GlobalState'

// Components
import Icon from 'js/components/Icon'

/**
 * Next and previous page button simply send an action type to the reducer.
 */
function NavigationButton({ action: type, disabled }) {
    const { dispatch } = useContext(TableState)

    // Callback to go to the next or previous page
    const changePageCallback = () => {
        dispatch({ type })
    }

    // Determine icon based on the button direction
    const icon = type === ACTIONS.PREV_PAGE ? 'chevron-left' : 'chevron-right'

    const classes = classNames(type === ACTIONS.PREV_PAGE ? 'is-left' : 'is-right', {
        'is-disabled': disabled,
    })

    return disabled
        ? <Icon as="button" icon={icon} className={classes} />
        : <Icon as="button" icon={icon} className={classes} onClick={changePageCallback} />
}

export default NavigationButton
