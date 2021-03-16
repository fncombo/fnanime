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

    // Watching anime to show at the top
    const watchingAnime = anime.filter(({ watchingStatus }) => watchingStatus === 'Watching')

    // Non-watching and non-planned anime to show for all the scores
    const restAnime = anime.filter(
        ({ watchingStatus }) => watchingStatus !== 'Planned' && watchingStatus !== 'Watching'
    )

    // Group all anime by score
    const groupedAnime = groupArray(restAnime, 'score') as Record<Score, Anime[]>

    // Sort scores from highest to lowest
    const sortedAnime = sort(Object.entries(groupedAnime)).desc(([score]) => parseInt(score, 10))

    return (
        <>
            <GallerySection score="Watching" anime={watchingAnime} />
            {sortedAnime.map(([score, scoreAnime]) => (
                <GallerySection score={parseInt(score, 10) as Score} anime={scoreAnime} key={score} />
            ))}
        </>
    )
}

export default Gallery
