import { FunctionComponent } from 'react'

import { Space, Tag, Typography } from 'antd'
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
        <Space>
            <Typography.Link
                href={url}
                target="_blank"
                rel="noreferrer noopener"
                onClick={(event): void => event.stopPropagation()}
            >
                <Typography.Text>{title}</Typography.Text>
            </Typography.Link>
            <Tag>{type}</Tag>
        </Space>
    </>
)

export default TitleCell
