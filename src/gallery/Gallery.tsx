import { FunctionComponent } from 'react'

import sort from 'fast-sort'
import groupArray from 'group-array'

import { useFilters } from '../filters/Filters'
import { Anime, Score } from '../types'

import GallerySection from './GallerySection'

/**
 * Displays a gallery section for each anime score. The first section is always anime which are currently being
 * watched. Anime with the watching status of "Watching" or "Planned" are excluded from score sections.
 */
const Gallery: FunctionComponent = () => {
    const { anime } = useFilters()

    const watchingAnime = anime.filter(({ watchingStatus }) => watchingStatus === 'Watching')
    const restAnime = anime.filter(({ watchingStatus }) => watchingStatus !== 'Watching')

    return (
        <>
            <GallerySection score="Watching" anime={watchingAnime} />
            {sort(Object.entries(groupArray(restAnime, 'score') as Record<Score, Anime[]>))
                .desc(([score]) => parseInt(score, 10))
                .map(([score, scoreAnime]) => (
                    <GallerySection
                        score={parseInt(score, 10) as Score}
                        anime={scoreAnime.filter(
                            ({ watchingStatus }) => watchingStatus !== 'Planned' && watchingStatus !== 'Watching'
                        )}
                        key={score}
                    />
                ))}
        </>
    )
}

export default Gallery
