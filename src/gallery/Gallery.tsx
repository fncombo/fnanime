import { FunctionComponent } from 'react'

import sort from 'fast-sort'
import groupArray from 'group-array'

import { Anime, Score } from '../types'

import GallerySection from './GallerySection'

/**
 * Displays a gallery section for each anime score. The first section is always anime which are currently being
 * watched. Anime with the watching status of "Watching" or "Planned" are excluded from score sections.
 */
const Gallery: FunctionComponent<{
    anime: Anime[]
}> = ({ anime }) => (
    <>
        <GallerySection score="Watching" anime={anime.filter(({ watchingStatus }) => watchingStatus === 'Watching')} />
        {sort(Object.entries(groupArray(anime, 'score') as Record<Score, Anime[]>))
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

export default Gallery
