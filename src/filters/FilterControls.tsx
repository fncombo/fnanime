import { FunctionComponent } from 'react'

import { Button, Col, Input, Radio, Row, Select, Space, Switch, Typography } from 'antd'
import styled from 'styled-components'

import { FilterOption, FilterValue } from './config'
import FilterLabel from './FilterLabel'
import { useFilters } from './Filters'

const SpacedRow = styled(Row)`
    margin: 24px;
`

const FlexCol = styled(Col)`
    display: flex;
    justify-content: center;
`

const RadioGroup = styled(Radio.Group)`
    display: flex;
    width: 100%;
`

const RadioButton = styled(Radio.Button)<{ hasAnime: boolean }>`
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
 * Displays controls for all filters, such as buttons, dropdowns, and inputs. Also displays toggles for advanced
 * filters and the table, and a button to reset all filters.
 */
const FilterControls: FunctionComponent<{
    hasTable: boolean
    toggleTable: () => void
}> = ({ hasTable, toggleTable }) => {
    const {
        filters,
        setFilter,
        resetFilters,
        searchValue,
        setSearchValue,
        hasAdvancedFilters,
        toggleAdvancedFilters,
        anime,
    } = useFilters()

    return (
        <SpacedRow gutter={[16, 16]}>
            {filters
                .filter(({ isSelect }) => !isSelect)
                .map(({ name, span, filterValue, options }) => (
                    <FlexCol span={span} key={name}>
                        <RadioGroup
                            value={filterValue}
                            buttonStyle="solid"
                            onChange={({ target: { value } }) => setFilter(name, value)}
                        >
                            {options.map(({ label, value, animeCount }) => (
                                <RadioButton value={value} hasAnime={value === -1 || !!animeCount} key={value}>
                                    <FilterLabel animeCount={animeCount}>{label}</FilterLabel>
                                </RadioButton>
                            ))}
                        </RadioGroup>
                    </FlexCol>
                ))}
            <Col span={hasAdvancedFilters ? 3 : 4}>
                <Input
                    placeholder="Search"
                    value={searchValue}
                    onChange={({ target: { value } }) => setSearchValue(value)}
                />
            </Col>
            {filters
                .filter(({ isSelect }) => isSelect)
                .map(({ name, options, placeholder }) => {
                    const optionsWithAnime = options.filter(({ animeCount }) => !!animeCount)
                    const optionsWithoutAnime = options.filter(({ animeCount }) => !animeCount)

                    const renderOption = ({ label, value, animeCount }: FilterOption) => (
                        <Select.Option value={value} key={value}>
                            <FilterLabel animeCount={animeCount}>{label}</FilterLabel>
                        </Select.Option>
                    )

                    return (
                        <Col span={hasAdvancedFilters ? 5 : 7} key={name}>
                            <FullWidthSelect
                                mode="multiple"
                                allowClear
                                maxTagCount="responsive"
                                placeholder={placeholder}
                                onChange={(value) => setFilter(name, value as FilterValue)}
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
                        onChange={toggleTable}
                    />
                    <AnimeCount>{anime.length} anime</AnimeCount>
                    <Button onClick={resetFilters}>Reset</Button>
                </ButtonsSpace>
            </Col>
        </SpacedRow>
    )
}

export default FilterControls
