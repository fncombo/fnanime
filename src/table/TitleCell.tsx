import { FunctionComponent } from 'react'

import { Tag, Typography } from 'antd'
import styled from 'styled-components'

import { Anime } from '../types'

const Image = styled.img`
    margin: -16px 16px -16px -16px;
`

/**
 * Displays the anime title along with its image and type. The title is a link to the anime's page on MyAnimeList.net.
 */
const TitleCell: FunctionComponent<{
    title: string
    anime: Anime
}> = ({ title, anime: { image, type, url } }) => (
    <>
        <Image src={image} alt={title} width={41} height={55} />
        <a href={url} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()}>
            <Typography.Text>{title}</Typography.Text>
        </a>{' '}
        <Tag>{type}</Tag>
    </>
)

export default TitleCell
