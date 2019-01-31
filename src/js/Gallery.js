// Libraries
import ClassNames from 'classnames'

// React
import React, { PureComponent, Fragment } from 'react'

// Style
import '../css/Gallery.css'

// Components
import Data from './Data'
import StatusPill from './StatusPill'

// Make a gallery for each rating which has matching anime
export default class Gallery extends PureComponent {
    render() {
        const { anime, openInfoBox } = this.props

        // Count how many anime for each rating
        let ratingCounts = Array(11).fill(0)
        anime.forEach(anime => ratingCounts[anime.rating]++)

        // Only show ratings which have anime, and exclude all non-rated anime
        return ratingCounts.slice(1).reverse().map((count, rating) => {
            rating = 10 - rating

            if (!count) {
                return null
            }

            return (
                <div key={rating}>
                    <h2 className="text-center rounded p-3">
                        {Data.lookup.rating[rating]}
                    </h2>
                    <div className="gallery-grid">
                        {anime.filter(anime => anime.rating === rating).map(anime =>
                            <GalleryItem anime={anime} openInfoBox={openInfoBox} key={anime.hash} />
                        )}
                    </div>
                </div>
            )
        })
    }
}

// Single gallery item
class GalleryItem extends PureComponent {
    render() {
        const { anime, openInfoBox } = this.props

        const itemClasses = ClassNames('gallery-item', {
            'not-downloaded': !anime.downloaded,
        })

        return (
            <div className={itemClasses} onMouseDown={event => openInfoBox(anime.id, event)} key={anime.hash}>
                <img src={anime.img} alt={anime.title} />
                <StatusPill
                    animeId={anime.id}
                    overrideText={anime.episodes > 1 ? <Fragment>{Data.getAnimeTypeText(anime.id)} &ndash; {anime.episodes} ep</Fragment> : Data.getAnimeTypeText(anime.id)}
                />
            </div>
        )
    }
}