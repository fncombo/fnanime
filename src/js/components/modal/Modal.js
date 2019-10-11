// React
import React, { useState, useContext, useEffect } from 'react'

// Style
import 'scss/Modal.scss'
import 'react-slidedown/lib/slidedown.css'

// Data
import { GlobalState, ACTIONS } from 'js/data/GlobalState'
import { FILTERS } from 'js/data/Filters'

// Helpers
import { getAdjacentAnime } from 'js/helpers/Modal'

// Components
import NavigationButton from 'js/components/modal/NavigationButton'
import ModalBody from 'js/components/modal/ModalBody'
import Icon from 'js/components/Icon'

/**
 * All the modal HTML including managing what it's displaying and its animations.
 */
function Modal({ closeModal: closeCallback, ...props }) {
    const { state: { anime: allAnime } } = useContext(GlobalState)
    const [ anime, setAnime ] = useState(props)

    // Callback to change the anime info inside the modal with a transition animation in between
    const changeAnime = newAnime => {
        document.body.classList.add('is-changing')

        setTimeout(() => {
            document.body.classList.remove('is-changing')

            setAnime(newAnime)
        }, 150)
    }

    // Callback to close the modal after it has finished animating out
    const closeModal = () => {
        document.body.classList.remove('is-active')

        setTimeout(() => {
            closeCallback()
        }, 150)
    }

    // Switch between next and previous anime using arrow keys and close the modal using esc
    const keyHandler = ({ key }) => {
        if (key === 'Escape') {
            closeModal()
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
                    <Icon as="button" icon="times-circle" size="lg" onClick={closeModal} />
                </div>
                <div className="modal-card-body">
                    <ModalBody closeModal={closeModal} changeAnime={changeAnime} {...anime} />
                </div>
            </div>
            <NavigationButton direction={ACTIONS.NEXT_ANIME} changeAnime={changeAnime} currentAnimeId={anime.id} />
        </div>
    )
}

export default Modal
