import { FunctionComponent } from 'react'

import { Table } from 'antd'
import { ColumnsType } from 'antd/lib/table'
import styled, { createGlobalStyle } from 'styled-components'

import { useFilters } from '../filters/Filters'
import { useModal } from '../modal/Modal'
import { Anime } from '../types'

import TableCell from './TableCell'
import TitleCell from './TitleCell'

const widths = {
    sm: '4%',
    md: '7%',
    lg: '9%',
    xl: '11%',
}

const { compare } = new Intl.Collator(undefined, { numeric: true })

const columns: ColumnsType<Anime> = [
    {
        title: 'Title',
        dataIndex: 'title',
        key: 'title',
        render: (title, anime) => <TitleCell title={title} anime={anime} />,
        sorter: (a, b) => compare(a.title, b.title),
    },
    {
        title: 'Status',
        dataIndex: 'watchingStatus',
        key: 'watchingStatus',
        render: (value) => <TableCell filter="watchingStatus">{value}</TableCell>,
        sorter: (a, b) => compare(a.watchingStatus, b.watchingStatus),
        align: 'center',
        width: widths.xl,
    },
    {
        title: 'Score',
        dataIndex: 'score',
        key: 'score',
        render: (value) => <TableCell>{value}</TableCell>,
        sorter: (a, b) => a.score - b.score,
        align: 'center',
        width: widths.sm,
    },
    {
        title: 'Rewatched',
        dataIndex: 'rewatchCount',
        key: 'rewatchCount',
        render: (value) => <TableCell>{value}</TableCell>,
        align: 'center',
        width: widths.md,
    },
    {
        title: 'Release',
        dataIndex: 'release',
        key: 'release',
        render: (value) => <TableCell>{value}</TableCell>,
        sorter: (a, b) => compare(a.release || '', b.release || ''),
        align: 'center',
        width: widths.md,
    },
    {
        title: 'Resolution',
        dataIndex: 'resolution',
        key: 'resolution',
        render: (value) => <TableCell filter="resolution">{value}</TableCell>,
        sorter: (a, b) => (a.resolution || 0) - (b.resolution || 0),
        align: 'center',
        width: widths.md,
    },
    {
        title: 'Source',
        dataIndex: 'source',
        key: 'source',
        render: (value) => <TableCell filter="source">{value}</TableCell>,
        sorter: (a, b) => compare(a.source || '', b.source || ''),
        align: 'center',
        width: widths.sm,
    },
    {
        title: 'Video',
        dataIndex: 'videoCodec',
        key: 'videoCodec',
        render: (value) => <TableCell filter="videoCodec">{value}</TableCell>,
        sorter: (a, b) => compare(a.videoCodec || '', b.videoCodec || ''),
        align: 'center',
        width: widths.sm,
    },
    {
        title: 'Audio',
        dataIndex: 'audioCodec',
        key: 'audioCodec',
        render: (value) => <TableCell filter="audioCodec">{value}</TableCell>,
        sorter: (a, b) => compare(a.audioCodec || '', b.audioCodec || ''),
        align: 'center',
        width: widths.sm,
    },
    {
        title: 'Quality',
        dataIndex: 'quality',
        key: 'quality',
        render: (value) => <TableCell>{value}</TableCell>,
        align: 'center',
        width: widths.sm,
    },
    {
        title: 'Episode Size',
        dataIndex: 'episodeSize',
        key: 'episodeSize',
        render: (value) => <TableCell>{value}</TableCell>,
        align: 'center',
        width: widths.lg,
    },
    {
        title: 'Total Size',
        dataIndex: 'totalSize',
        key: 'totalSize',
        render: (value) => <TableCell>{value}</TableCell>,
        align: 'center',
        width: widths.lg,
    },
]

const advancedColumns = [
    'release',
    'resolution',
    'source',
    'videoCodec',
    'audioCodec',
    'quality',
    'episodeSize',
    'totalSize',
]

const TableContainer = styled.div`
    padding: 16px 0;
`

const TableRow = styled.div``

const GlobalStyle = createGlobalStyle`
    ${TableRow} {
        cursor: pointer;
    }
`

/**
 * Displays the given anime in a sortable, paginated table. When advanced filters are enabled, additional columns
 * are displayed.
 */
const AnimeTable: FunctionComponent = () => {
    const { anime, hasAdvancedFilters } = useFilters()
    const openModal = useModal()

    return (
        <TableContainer>
            <GlobalStyle />
            <Table
                dataSource={anime}
                columns={
                    hasAdvancedFilters ? columns : columns.filter(({ key }) => !advancedColumns.includes(key as string))
                }
                rowClassName={TableRow.styledComponentId}
                pagination={{ position: ['bottomCenter'] }}
                sortDirections={['ascend', 'descend']}
                onRow={({ id }) => ({
                    onClick: () => openModal(id),
                })}
            />
        </TableContainer>
    )
}

export default AnimeTable
