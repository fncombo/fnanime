import React, { useContext } from 'react'

import { SlideDown } from 'react-slidedown'

import { ModalState } from 'src/data/GlobalState'

import Icon from 'src/components/Icon'

/**
 * Single-line loading placeholder.
 */
function Loading({ children, ...rest }) {
    const {
        modalState: { isLoaded, isError },
    } = useContext(ModalState)

    if (isError) {
        return <LoadingError />
    }

    return isLoaded ? children : <span {...rest} />
}

/**
 * Inline, shorter loading placeholder.
 */
function LoadingInline({ children }) {
    return <Loading className="loading-text loading-inline">{children}</Loading>
}

/**
 * Full line loading placeholder.
 */
function LoadingText({ children }) {
    return <Loading className="loading-text">{children}</Loading>
}

/**
 * Message for when an error has occurred while fetching data and it can't be displayed.
 */
function LoadingError() {
    return (
        <span className="modal-error has-text-danger">
            <Icon icon="exclamation-circle" /> An error has occurred
        </span>
    )
}

/**
 * A multi-line loading paragraphs placeholder which animates to the correct height when the content has loaded.
 */
function LoadingParagraph({ children }) {
    const {
        modalState: { isLoaded, isError },
    } = useContext(ModalState)

    if (isError) {
        return <LoadingError />
    }

    return (
        <SlideDown className={`loading-paragraph ${isLoaded ? 'is-loaded' : 'is-loading'}`}>
            <div className="placeholders">
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
            </div>
            <div className={`loading-content ${isLoaded ? 'is-loaded' : 'is-loading'}`}>
                {isLoaded ? children : null}
            </div>
        </SlideDown>
    )
}

// Exports
export { LoadingInline, LoadingText, LoadingParagraph }
