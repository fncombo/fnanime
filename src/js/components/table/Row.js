// React
import React from 'react'

// Data
import { FILTERS } from 'js/data/Filters'

// Components
import ModalContainer from 'js/components/modal/ModalContainer'
import TitleColumn from 'js/components/table/TitleColumn'
import Column from 'js/components/table/Column'
import Badge from 'js/components/Badge'
import SizeColumns from 'js/components/table/SizeColumns'

/**
 * Default table row of data for a single anime. Contains the anime image and all the various columns.
 * Clicking on the table rows brings up the modal for its anime.
 */
function Row(anime) {
    return (
        <ModalContainer anime={anime} className="table-row" href={anime.url} target="_blank" rel="noopener noreferrer">
            <img
                className="table-column is-img"
                width="33"
                height="45"
                src={anime.img}
                alt={anime.title}
                loading="lazy"
                style={{ gridArea: 'img' }}
            />
            <TitleColumn {...anime} />
            <Column columnName="status">
                <Badge showAirStatus {...anime} />
            </Column>
            <Column columnName="rating">
                {anime.rating}
            </Column>
            <Column columnName="rewatchCount">
                {anime.rewatchCount}
            </Column>
            <Column columnName="subs" value={anime.subs}>
                <span className="has-text-overflow">
                    {anime.subs.length ? anime.subs.join(', ') : <>&mdash;</>}
                </span>
            </Column>
            <Column columnName="resolution" value={anime.resolution}>
                {FILTERS.resolution.descriptions[anime.resolution]}
            </Column>
            <Column columnName="source">
                {anime.source}
            </Column>
            <Column columnName="videoCodec">
                {anime.videoCodec}
            </Column>
            <Column columnName="audioCodec">
                {anime.audioCodec}
            </Column>
            <Column columnName="fileQuality" value={anime.fileQuality}>
                {anime.fileQuality ? anime.fileQuality.toLocaleString() : null}
            </Column>
            <SizeColumns episodeSize={anime.episodeSize} size={anime.size} />
        </ModalContainer>
    )
}

export default Row
