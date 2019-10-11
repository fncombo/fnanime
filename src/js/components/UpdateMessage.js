// React
import React, { useContext } from 'react'

// Libraries
import classNames from 'classnames'

// Data
import { GlobalState } from 'js/data/GlobalState'

// Components
import Icon from 'js/components/Icon'

/**
 * Message indicating the loading status of the API update.
 */
function UpdateMessage() {
    const { state: { apiUpdated, apiError } } = useContext(GlobalState)

    const classes = classNames('message', apiUpdated ? 'is-done' : 'is-loading')

    let updateStatusMessage

    if (apiUpdated) {
        updateStatusMessage = apiError
            ? <><Icon icon="times-circle" /> Error contacting API</>
            : <><Icon icon="check-circle" /> Updated</>
    } else {
        updateStatusMessage = <><Icon icon="database" /> Loading latest information</>
    }

    return (
        <div className={classes}>
            {updateStatusMessage}
        </div>
    )
}

export default UpdateMessage
