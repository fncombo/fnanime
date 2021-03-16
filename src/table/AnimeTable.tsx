import { FunctionComponent, HTMLAttributes, ReactNode } from 'react'

import { Table } from 'antd'
import { ColumnsType, ColumnType } from 'antd/lib/table'
import styled, { createGlobalStyle } from 'styled-components'

import { useFilters } from '../filters/Filters'
import { useModal } from '../modal/Modal'
import { Anime } from '../types'

import CellValue from './CellValue'
import TitleCell from './TitleCell'

const widths = {
    sm: '4%',
    md: '7%',
    lg: '9%',
    xl: '11%',
}

const { compare } = new Intl.Collator(undefined, {
    numeric: true,
})

const columns: ColumnsType<Anime> = [
    {
        title: 'Title',
        dataIndex: 'title',
        render: (title, anime): ReactNode => <TitleCell title={title} anime={anime} />,
        sorter: (a, b): number => compare(a.title, b.title),
    },
    {
        title: 'Status',
        dataIndex: 'watchingStatus',
        render: (value): ReactNode => <CellValue filter="watchingStatus">{value}</CellValue>,
        sorter: (a, b): number => compare(a.watchingStatus, b.watchingStatus),
        align: 'center',
        width: widths.xl,
    },
    {
        title: 'Score',
        dataIndex: 'score',
        render: (value): ReactNode => <CellValue>{value}</CellValue>,
        sorter: (a, b): number => a.score - b.score,
        align: 'center',
        width: widths.sm,
    },
    {
        title: 'Rewatched',
        dataIndex: 'rewatched',
        render: (value): ReactNode => <CellValue>{value}</CellValue>,
        align: 'center',
        width: widths.md,
    },
    {
        title: 'Release',
        dataIndex: 'release',
        render: (value): ReactNode => <CellValue>{value}</CellValue>,
        sorter: (a, b): number => compare(a.release || '', b.release || ''),
        align: 'center',
        width: widths.md,
    },
    {
        title: 'Resolution',
        dataIndex: 'resolution',
        render: (value): ReactNode => <CellValue filter="resolution">{value}</CellValue>,
        sorter: (a, b): number => (a.resolution || 0) - (b.resolution || 0),
        align: 'center',
        width: widths.md,
    },
    {
        title: 'Source',
        dataIndex: 'source',
        render: (value): ReactNode => <CellValue filter="source">{value}</CellValue>,
        sorter: (a, b): number => compare(a.source || '', b.source || ''),
        align: 'center',
        width: widths.sm,
    },
    {
        title: 'Video',
        dataIndex: 'videoCodec',
        render: (value): ReactNode => <CellValue filter="videoCodec">{value}</CellValue>,
        sorter: (a, b): number => compare(a.videoCodec || '', b.videoCodec || ''),
        align: 'center',
        width: widths.sm,
    },
    {
        title: 'Audio',
        dataIndex: 'audioCodec',
        render: (value): ReactNode => <CellValue filter="audioCodec">{value}</CellValue>,
        sorter: (a, b): number => compare(a.audioCodec || '', b.audioCodec || ''),
        align: 'center',
        width: widths.sm,
    },
    {
        title: 'Quality',
        dataIndex: 'quality',
        render: (value): ReactNode => <CellValue>{value}</CellValue>,
        align: 'center',
        width: widths.sm,
    },
    {
        title: 'Episode Size',
        dataIndex: 'episodeSize',
        render: (value): ReactNode => <CellValue>{value}</CellValue>,
        align: 'center',
        width: widths.lg,
    },
    {
        title: 'Total Size',
        dataIndex: 'totalSize',
        render: (value): ReactNode => <CellValue>{value}</CellValue>,
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

    const tableColumns = hasAdvancedFilters
        ? columns
        : columns.filter(({ dataIndex }: ColumnType<Anime>) => !advancedColumns.includes(dataIndex as string))

    return (
        <TableContainer>
            <GlobalStyle />
            <Table
                dataSource={anime}
                columns={tableColumns}
                rowClassName={TableRow.styledComponentId}
                pagination={{ position: ['bottomCenter'] }}
                sortDirections={['ascend', 'descend']}
                onRow={({ id }): HTMLAttributes<HTMLElement> => ({
                    onClick: (): void => openModal(id),
                })}
            />
        </TableContainer>
    )
}

export default AnimeTable
