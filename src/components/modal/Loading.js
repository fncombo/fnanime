import React, { useContext } from 'react'
import PropTypes from 'prop-types'

import { SlideDown } from 'react-slidedown'

import { ModalState } from 'src/data/global-state'

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

Loading.propTypes = {
    children: PropTypes.node.isRequired,
}

/**
 * Inline, shorter loading placeholder.
 */
function LoadingInline({ children }) {
    return <Loading className="loading-text loading-inline">{children}</Loading>
}

LoadingInline.propTypes = {
    children: PropTypes.node.isRequired,
}

/**
 * Full line loading placeholder.
 */
function LoadingText({ children }) {
    return <Loading className="loading-text">{children}</Loading>
}

LoadingText.propTypes = {
    children: PropTypes.node.isRequired,
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

LoadingParagraph.propTypes = {
    children: PropTypes.node.isRequired,
}

export { LoadingInline, LoadingText, LoadingParagraph }
