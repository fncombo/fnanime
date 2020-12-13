import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'

import { clearAllBodyScrollLocks, disableBodyScroll } from 'body-scroll-lock'

import { FILTERS } from 'src/helpers/filters'
import { PROP_TYPES } from 'src/helpers/generic'
import { ACTIONS, GlobalState } from 'src/helpers/global-state'
import { getAdjacentAnime } from 'src/helpers/modal'

import Icon from 'src/components/Icon'
import CopyIcon from 'src/components/modal/CopyIcon'
import ModalBody from 'src/components/modal/ModalBody'
import NavigationButton from 'src/components/modal/NavigationButton'

import 'src/styles/Modal.scss'

/**
 * All the modal HTML including managing what it's displaying and its animations.
 */
export default function Modal({ closeModal: closeCallback, anime: propAnime }) {
    const {
        state: { anime: allAnime },
    } = useContext(GlobalState)
    const [anime, setAnime] = useState(propAnime)
    const modalBodyRef = useRef(null)

    // Callback to change the anime info inside the modal with a transition animation in between
    const changeAnime = useCallback((newAnime) => {
        document.body.classList.add('is-changing')

        setTimeout(() => {
            document.body.classList.remove('is-changing')

            setAnime(newAnime)
        }, 150)
    }, [])

    // Callback to close the modal after it has finished animating out
    const closeModal = useCallback(() => {
        document.body.classList.remove('is-active')

        setTimeout(() => {
            closeCallback()
        }, 150)
    }, [closeCallback])

    // Switch between next and previous anime using arrow keys and close the modal using esc
    const keyHandler = useCallback(
        ({ key }) => {
            if (key === 'Escape') {
                closeModal()

                return
            }

            if (key !== 'ArrowLeft' && key !== 'ArrowRight') {
                return
            }

            const direction = key === 'ArrowLeft' ? ACTIONS.PREV_ANIME : ACTIONS.NEXT_ANIME
            const adjacentAnime = getAdjacentAnime(allAnime, anime.id, direction)

            if (adjacentAnime) {
                changeAnime(adjacentAnime)
            }
        },
        [allAnime, anime.id, changeAnime, closeModal]
    )

    // Add and remove the modal open classes from the body
    useEffect(() => {
        disableBodyScroll(modalBodyRef.current, { reserveScrollBarGap: true })

        document.body.classList.add('is-active')

        document.documentElement.classList.add('is-clipped')

        window.addEventListener('keyup', keyHandler)

        return () => {
            document.body.classList.remove('is-active')

            document.documentElement.classList.remove('is-clipped')

            window.removeEventListener('keyup', keyHandler)

            clearAllBodyScrollLocks()
        }
    })

    return (
        <div className="modal">
            <div className="modal-background" onClick={closeModal} />
            <NavigationButton direction={ACTIONS.PREV_ANIME} changeAnime={changeAnime} currentAnimeId={anime.id} />
            <div className={`modal-card has-background-${FILTERS.status.colorCodes[anime.status]}`}>
                <div className="modal-card-head">
                    <h5 className="modal-card-title">
                        <a href={anime.url} target="_blank" rel="noopener noreferrer">
                            {anime.title}
                        </a>
                    </h5>
                    <CopyIcon value={anime.title} />
                    <Icon as="button" type="button" title="Close" icon="times-circle" onClick={closeModal} />
                </div>
                <div className="modal-card-body" ref={modalBodyRef}>
                    <ModalBody closeModal={closeModal} changeAnime={changeAnime} anime={anime} />
                </div>
            </div>
            <NavigationButton direction={ACTIONS.NEXT_ANIME} changeAnime={changeAnime} currentAnimeId={anime.id} />
        </div>
    )
}

Modal.propTypes = {
    closeModal: PropTypes.func.isRequired,
    anime: PROP_TYPES.ANIME.isRequired,
}
