import React, { useState } from 'react'

import copy from 'copy-text-to-clipboard'

import Icon from 'src/components/Icon'

// Copy statuses
const COPY_STATUS = {
    INITIAL: 'Copy title',
    SUCCESS: 'Title copied!',
    FAIL: 'Error copying',
}

/**
 * Copy icon with tooltips. Copies the value to clipboard on click.
 */
export default function CopyIcon({ value }) {
    const [copyStatus, setCopyStatus] = useState(COPY_STATUS.INITIAL)

    // Nothing to copy
    if (!value) {
        return null
    }

    // Callback to reset the title when the mouse leaves and the tooltip is fully faded out
    function onMouseOutCallback() {
        if (copyStatus !== COPY_STATUS.INITIAL) {
            setTimeout(() => {
                setCopyStatus(COPY_STATUS.INITIAL)
            }, 150)
        }
    }

    // Callback to try and copy the title and change the status based on whether it succeeded
    function onClickCallback() {
        const didCopy = copy(value)

        setCopyStatus(didCopy ? COPY_STATUS.SUCCESS : COPY_STATUS.FAIL)
    }

    return (
        <div className="copy-icon" onMouseOut={onMouseOutCallback} onClick={onClickCallback}>
            <Icon as="button" type="button" icon="copy" />
            <div className="copy-tooltip">{copyStatus}</div>
        </div>
    )
}
