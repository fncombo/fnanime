import React, { useContext, useEffect, useState } from 'react'
import PropTypes from 'prop-types'

import { FILTERS } from 'src/data/filters'
import { ACTIONS, GlobalState } from 'src/data/global-state'

import { PROP_TYPES } from 'src/helpers/generic'
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

    /**
     * Callback to change the anime info inside the modal with a transition animation in between.
     */
    function changeAnime(newAnime) {
        document.body.classList.add('is-changing')

        setTimeout(() => {
            document.body.classList.remove('is-changing')

            setAnime(newAnime)
        }, 150)
    }

    /**
     * Callback to close the modal after it has finished animating out.
     */
    function closeModal() {
        document.body.classList.remove('is-active')

        setTimeout(() => {
            closeCallback()
        }, 150)
    }

    /**
     * Switch between next and previous anime using arrow keys and close the modal using esc.
     */
    function keyHandler({ key }) {
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
    }

    // Add and remove the modal open classes from the body
    useEffect(() => {
        document.body.classList.add('is-active')

        document.documentElement.classList.add('is-clipped')

        window.addEventListener('keyup', keyHandler)

        return () => {
            document.body.classList.remove('is-active')

            document.documentElement.classList.remove('is-clipped')

            window.removeEventListener('keyup', keyHandler)
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
                <div className="modal-card-body">
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
