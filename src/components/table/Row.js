import React from 'react'

import { FILTERS } from 'src/data/Filters'

import ModalContainer from 'src/components/modal/ModalContainer'
import TitleColumn from 'src/components/table/TitleColumn'
import Column from 'src/components/table/Column'
import Badge from 'src/components/Badge'
import SizeColumns from 'src/components/table/SizeColumns'

/**
 * Default table row of data for a single anime. Contains the anime image and all the various columns.
 * Clicking on the table rows brings up the modal for its anime.
 */
export default function Row(anime) {
    return (
        <ModalContainer anime={anime} className="table-row">
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
            <Column columnName="rating">{anime.rating}</Column>
            <Column columnName="rewatchCount">{anime.rewatchCount}</Column>
            <Column columnName="subs" value={anime.subs}>
                <span className="has-text-overflow">{anime.subs.length ? anime.subs.join(', ') : <>&mdash;</>}</span>
            </Column>
            <Column columnName="resolution" value={anime.resolution}>
                {FILTERS.resolution.descriptions[anime.resolution]}
            </Column>
            <Column columnName="source">{anime.source}</Column>
            <Column columnName="videoCodec">{anime.videoCodec}</Column>
            <Column columnName="audioCodec">{anime.audioCodec}</Column>
            <Column columnName="fileQuality" value={anime.fileQuality}>
                {anime.fileQuality ? anime.fileQuality.toLocaleString() : null}
            </Column>
            <SizeColumns episodeSize={anime.episodeSize} size={anime.size} />
        </ModalContainer>
    )
}
