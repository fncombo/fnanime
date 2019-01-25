// Libraries
import ClassNames from 'classnames'

// React
import React, { PureComponent } from 'react'

// Style
import '../css/Gallery.css'

// Data
import data from './data.json'

// Make a gallery for each rating which has matching anime
export default class Gallery extends PureComponent {
    render() {
        const { anime, openInfoBox } = this.props

        // Count how many anime for each rating
        let ratingCounts = new Array(11).fill(0)
        anime.forEach(anime => ratingCounts[anime.rating]++)

        // Only show ratings which have anime, and exclude all zero-rated anime
        return ratingCounts.slice(1).reverse().map((count, rating) => {
            rating = 10 - rating

            if (!count) {
                return null
            }

            return (
                <div key={rating}>
                    <h2 className="text-center rounded p-3">
                        {data.lookup.rating[rating]}
                    </h2>
                    <div className="gallery-grid">
                        {anime.filter(anime => anime.rating === rating).map(anime =>
                            <GalleryItem anime={anime} openInfoBox={openInfoBox} key={anime.id} />
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
            <div className={itemClasses} onClick={() => openInfoBox(anime.id)} key={anime.id}>
                <img src={anime.img} alt={anime.title} />
                <span className={`status-pill status-pill-${data.lookup.statusColor[anime.status]} rounded-0`}>
                    {data.lookup.type[anime.hasOwnProperty('typeActual') ? anime.typeActual : anime.type]}
                    {anime.episodes > 1 && ` ${anime.episodes} ep`}
                </span>
            </div>
        )
    }
}