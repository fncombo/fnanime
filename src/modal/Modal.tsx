import { createContext, FunctionComponent, useContext, useState } from 'react'

import { Modal, Typography } from 'antd'

import { Anime } from '../types'

import ModalContent from './ModalContent'

type ModalContext = (animeId: number) => void

const ModalContext = createContext<ModalContext | undefined>(undefined)

/**
 * Hook to access the modal context.
 */
const useModal = (): ModalContext => useContext(ModalContext) as ModalContext

/**
 * Provides a function to open the modal for a particular anime.
 */
const ModalProvider: FunctionComponent<{
    anime: Anime[]
}> = ({ anime, children }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedAnime, setSelectedAnime] = useState<Anime>()

    const openModal = (selectedAnimeId: number): void => {
        setSelectedAnime(anime.find(({ id }) => id === selectedAnimeId))

        setIsOpen(true)
    }

    const closeModal = (): void => setIsOpen(false)

    const getAnime = (id: number): Anime => anime.find(({ id: animeId }) => animeId === id) as Anime

    return (
        <ModalContext.Provider value={openModal}>
            {children}
            <Modal
                visible={isOpen}
                title={
                    selectedAnime && (
                        <Typography.Text copyable={{ text: selectedAnime.title }}>
                            <strong>{selectedAnime.title}</strong>
                        </Typography.Text>
                    )
                }
                onCancel={closeModal}
                destroyOnClose
                footer={null}
                centered
                width={1200}
            >
                {selectedAnime && <ModalContent anime={selectedAnime} getAnime={getAnime} openModal={openModal} />}
            </Modal>
        </ModalContext.Provider>
    )
}

export { ModalProvider, useModal }
