// React
import React, { Component, PureComponent, Fragment } from 'react'

// Style
import '../css/Gallery.css'

// Components
import Data from './Data'

// Make a gallery for each rating which has matching anime
export default class Gallery extends Component {
    render() {
        const { anime, openInfoBox, isDetailView } = this.props

        // Count how many anime for each rating
        const ratingCounts = Array(11).fill(0)
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
                        {Data.filters.rating.descriptions[rating]}
                    </h2>
                    <div className="gallery-grid">
                        {anime.filter(anime => anime.rating === rating).map(anime =>
                            <GalleryItem anime={anime} openInfoBox={openInfoBox} isDetailView={isDetailView} key={anime.hash} />
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
        const { anime, openInfoBox, isDetailView } = this.props

        return (
            <div
                className={`gallery-item ${isDetailView && !anime.size ? 'not-downloaded' : ''}`}
                onMouseDown={event => openInfoBox(anime.id, event)} key={anime.hash}
            >
                <div className="gallery-item-inner">
                    <img src={anime.img} alt={anime.title} />
                    <span className={`badge p-2 rounded-0 rounded-bottom badge-${Data.filters.status.colorCodes[anime.status]}`}>
                        {anime.episodes > 1 ?
                            <Fragment>{Data.filters.type.descriptions[anime.actualType]} &ndash; {anime.episodes} ep</Fragment> :
                            Data.filters.type.descriptions[anime.actualType]
                        }
                    </span>
                </div>
                <span className="gallery-tooltip">{anime.title}</span>
            </div>
        )
    }
}
