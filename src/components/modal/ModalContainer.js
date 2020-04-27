import React, { useCallback, useState } from 'react'
import PropTypes from 'prop-types'

import { Portal } from 'react-portal'

import { PROP_TYPES } from 'src/helpers/generic'

import Modal from 'src/components/modal/Modal'

/**
 * Makes any element a button to open a portal to a modal.
 */
export default function ModalContainer({ as: Element = 'a', anime, children, ...rest }) {
    const [isModalOpen, setModalOpen] = useState(false)

    // Callback to open the modal when the main element is clicked
    const openModal = useCallback((event) => {
        if (event.button === 0) {
            event.preventDefault()

            setModalOpen(true)
        }
    }, [])

    // Callback to close the modal
    const closeModal = useCallback(() => {
        setModalOpen(false)
    }, [])

    // If the element is a link, set options for valid link to the anime page
    // Do not put modal inside the Element as that messes up click events: they all get handled by `openModal`
    // and are therefore "default prevented"
    return (
        <>
            {Element === 'a' ? (
                <Element onClick={openModal} href={anime.url} target="_blank" rel="noopener noreferrer" {...rest}>
                    {children}
                </Element>
            ) : (
                <Element onClick={openModal} {...rest}>
                    {children}
                </Element>
            )}
            {isModalOpen && (
                <Portal>
                    <Modal closeModal={closeModal} anime={anime} />
                </Portal>
            )}
        </>
    )
}

ModalContainer.propTypes = {
    as: PropTypes.string,
    anime: PROP_TYPES.ANIME.isRequired,
    children: PropTypes.node.isRequired,
}
