import { FunctionComponent } from 'react'

import { Button, Col, Input, Radio, Row, Select, Space, Switch, Typography } from 'antd'
import styled from 'styled-components'

import { FiltersConfigOption } from '../types'

import FilterLabel from './FilterLabel'
import { FiltersHook } from './useFilters'

const FiltersRow = styled(Row)`
    margin: 24px;
`

const FullWidthCol = styled(Col)`
    display: flex;
    justify-content: center;
`

const FilterGroup = styled(Radio.Group)`
    display: flex;
    width: 100%;
`

const FilterButton = styled(Radio.Button)<{ hasAnime: boolean }>`
    flex: 1 1 auto;
    padding: 0;
    opacity: ${({ hasAnime }) => (hasAnime ? 1 : 0.5)};
    text-align: center;
`

const FullWidthSelect = styled(Select)`
    width: 100%;
`

const ButtonsSpace = styled(Space)`
    width: 100%;
    justify-content: space-between;
`

const AnimeCount = styled(Typography.Text)`
    text-align: center;
`

/**
 * Displays the buttons and inputs for all filters.
 */
const Filters: FunctionComponent<
    FiltersHook & {
        hasTable: boolean
        setHasTable: (value: boolean) => void
    }
> = ({
    filters,
    selectFilters,
    setFilter,
    resetFilters,
    searchValue,
    setSearchValue,
    hasAdvancedFilters,
    toggleAdvancedFilters,
    filteredAnime,
    hasTable,
    setHasTable,
}) => (
    <FiltersRow gutter={[16, 16]}>
        {filters.map(({ key, span, filterValue, options }) => (
            <FullWidthCol span={span} key={key}>
                <FilterGroup
                    value={filterValue}
                    buttonStyle="solid"
                    onChange={({ target: { value } }) => setFilter(key, value)}
                >
                    {options.map(({ label, value, animeCount }: FiltersConfigOption) => (
                        <FilterButton value={value} hasAnime={value === -1 || !!animeCount} key={value}>
                            <FilterLabel animeCount={animeCount}>{label}</FilterLabel>
                        </FilterButton>
                    ))}
                </FilterGroup>
            </FullWidthCol>
        ))}
        <Col span={hasAdvancedFilters ? 3 : 4}>
            <Input
                placeholder="Search"
                value={searchValue}
                onChange={({ target: { value } }) => setSearchValue(value)}
            />
        </Col>
        {selectFilters.map(({ key, options, placeholder }) => {
            const optionsWithAnime = options.filter(({ animeCount }) => !!animeCount)
            const optionsWithoutAnime = options.filter(({ animeCount }) => !animeCount)

            const renderOption = ({ label, value, animeCount }: FiltersConfigOption) => (
                <Select.Option value={value} key={value}>
                    <FilterLabel animeCount={animeCount}>{label}</FilterLabel>
                </Select.Option>
            )

            return (
                <Col span={hasAdvancedFilters ? 5 : 7} key={key}>
                    <FullWidthSelect
                        mode="multiple"
                        allowClear
                        maxTagCount="responsive"
                        placeholder={placeholder}
                        onChange={(value) => setFilter(key, value as string)}
                    >
                        {!!optionsWithAnime.length && (
                            <Select.OptGroup label="Have Matching Anime">
                                {optionsWithAnime.map(renderOption)}
                            </Select.OptGroup>
                        )}
                        {!!optionsWithoutAnime.length && (
                            <Select.OptGroup label="No Matching Anime">
                                {optionsWithoutAnime.map(renderOption)}
                            </Select.OptGroup>
                        )}
                    </FullWidthSelect>
                </Col>
            )
        })}
        <Col span={6}>
            <ButtonsSpace>
                <Switch
                    checkedChildren="Advanced"
                    unCheckedChildren="Advanced"
                    checked={hasAdvancedFilters}
                    onChange={toggleAdvancedFilters}
                />
                <Switch
                    checkedChildren="Table"
                    unCheckedChildren="Table"
                    checked={hasTable}
                    onChange={() => setHasTable(!hasTable)}
                />
                <AnimeCount>{filteredAnime.length} anime</AnimeCount>
                <Button onClick={resetFilters}>Reset</Button>
            </ButtonsSpace>
        </Col>
    </FiltersRow>
)

export default Filters
