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
                    <h3 className="text-center rounded p-3">
                        {rating} - {data.lookup.rating[rating]}
                    </h3>
                    <div className="gallery-grid">
                        {anime.filter(anime => anime.rating === rating).map(anime =>
                            <GalleryItem
                                anime={anime}
                                openInfoBox={openInfoBox}
                                key={anime.id}
                            />
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

        return (
            <div className={`gallery-item ${!anime.downloaded ? 'not-downloaded' : ''}`} onClick={() => openInfoBox(anime.id)} key={anime.id}>
                {/* Using background image causes reflow and significantly impacts CSS rendering performance */}
                {/* <span className="image rounded-top" style={{backgroundImage: `url(${imageUrl})`}} /> */}
                <img src={anime.imageUrl} alt={anime.title} />
                <span className={`status-pill status-pill-${data.lookup.statusColor[anime.status]} rounded-0`}>
                    {data.lookup.actualType[anime.actualType]}
                    {anime.episodes > 1 && ` ${anime.episodes} ep`}
                </span>
            </div>
        )
    }
}