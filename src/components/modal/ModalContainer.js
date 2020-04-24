import React, { useState } from 'react'
import ReactDOM from 'react-dom'

import Modal from 'src/components/modal/Modal'

// DOM element into which to portal the modal
const MODAL_ELEMENT = document.getElementById('modal')

/**
 * Makes any element a button to open a portal to a modal.
 */
export default function ModalContainer({ as: Element = 'a', anime, children, ...rest }) {
    const [isModalOpen, setModalOpen] = useState(false)

    // Callback to open the modal when the main element is clicked
    function openModal(event) {
        if (event.button === 0) {
            event.preventDefault()

            setModalOpen(true)
        }
    }

    // Callback to close the modal
    function closeModal() {
        setModalOpen(false)
    }

    // If the element is a link, set options for valid link to the anime page
    const linkAttributes =
        Element === 'a'
            ? {
                  href: anime.url,
                  target: '_blank',
                  rel: 'noopener noreferrer',
              }
            : {}

    // Do not put modal inside the Element as that messes up click events: they all get handled by `openModal`
    // and are therefore "default prevented"
    return (
        <>
            <Element onClick={openModal} {...linkAttributes} {...rest}>
                {children}
            </Element>
            {isModalOpen && ReactDOM.createPortal(<Modal closeModal={closeModal} {...anime} />, MODAL_ELEMENT)}
        </>
    )
}
