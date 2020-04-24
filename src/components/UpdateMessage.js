import React, { useContext, useState } from 'react'

import classNames from 'classnames'

import { GlobalState } from 'src/data/GlobalState'

import Icon from 'src/components/Icon'

/**
 * Message indicating the loading status of the API update.
 */
export default function UpdateMessage({ hideTimeout = 3000 }) {
    const {
        state: { apiUpdated, apiError },
    } = useContext(GlobalState)
    const [isHidden, setIsHidden] = useState(false)

    const classes = classNames('message', {
        'is-loading': !apiUpdated,
        'is-hidden': isHidden,
    })

    let updateStatusMessage

    // If the API has been updated
    if (apiUpdated) {
        // Message based on success or error
        updateStatusMessage = apiError ? (
            <>
                <Icon icon="times-circle" /> Error contacting API
            </>
        ) : (
            <>
                <Icon icon="check-circle" /> Updated
            </>
        )

        // Set timeout to hide the message
        if (!isHidden) {
            setTimeout(() => {
                setIsHidden(true)
            }, hideTimeout)
        }

        // Loading in progress message
    } else {
        updateStatusMessage = (
            <>
                <Icon icon="database" /> Loading latest information
            </>
        )
    }

    return <div className={classes}>{updateStatusMessage}</div>
}
