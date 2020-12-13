import React, { useContext } from 'react'
import PropTypes from 'prop-types'

import { SlideDown } from 'react-slidedown'

import { ModalState } from 'src/helpers/global-state'

import Icon from 'src/components/Icon'

/**
 * Single-line loading placeholder.
 */
function Loading({ children, ...rest }) {
    const { isLoading, isError } = useContext(ModalState)

    if (isError) {
        return <LoadingError />
    }

    return isLoading ? <span {...rest} /> : children
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
    const { isLoading, isError } = useContext(ModalState)

    if (isError) {
        return <LoadingError />
    }

    return (
        <SlideDown className={`loading-paragraph ${isLoading ? 'is-loading' : 'is-loaded'}`}>
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
            <div className={`loading-content ${isLoading ? 'is-loading' : 'is-loaded'}`}>
                {isLoading ? null : children}
            </div>
        </SlideDown>
    )
}

LoadingParagraph.propTypes = {
    children: PropTypes.node.isRequired,
}

export { LoadingInline, LoadingText, LoadingParagraph }
