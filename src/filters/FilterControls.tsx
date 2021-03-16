import { FunctionComponent, ReactNode } from 'react'

import { Button, Col, Input, Radio, Row, Select, Space, Switch, Typography } from 'antd'
import styled from 'styled-components'

import { FilterOption, FilterValue } from './config'
import FilterControlsLabel from './FilterControlsLabel'
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

const RadioButton = styled(Radio.Button)<{
    hasAnime: boolean
}>`
    flex: 1 1 auto;
    padding: 0;
    opacity: ${({ hasAnime }): number => (hasAnime ? 1 : 0.5)};
    text-align: center;
`

const FullWidthSelect = styled(Select)`
    width: 100%;
`

const Buttons = styled(Space)`
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
    hasStatistics: boolean
    toggleStatistics: () => void
}> = ({ hasTable, toggleTable, hasStatistics, toggleStatistics }) => {
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

    const buttonFilters = filters.filter(({ isSelect }) => !isSelect)
    const selectFilters = filters.filter(({ isSelect }) => isSelect)

    return (
        <SpacedRow gutter={[16, 16]}>
            {buttonFilters.map(({ name, span, filterValue, options }) => (
                <FlexCol span={span} key={name}>
                    <RadioGroup
                        value={filterValue}
                        buttonStyle="solid"
                        onChange={({ target: { value } }): void => setFilter(name, value)}
                    >
                        {options.map(({ label, value, animeCount }) => (
                            <RadioButton value={value} hasAnime={value === -1 || !!animeCount} key={value}>
                                <FilterControlsLabel animeCount={animeCount}>{label}</FilterControlsLabel>
                            </RadioButton>
                        ))}
                    </RadioGroup>
                </FlexCol>
            ))}
            <Col span={4}>
                <Input
                    placeholder="Search"
                    value={searchValue}
                    onChange={({ target: { value } }): void => setSearchValue(value)}
                />
            </Col>
            {selectFilters.map(({ name, options, placeholder }) => {
                // Select requires its own components to be direct children so this cannot be abstracted away under
                // a custom component
                const haveMatchingAnime = options.filter(({ animeCount }) => !!animeCount)
                const noMatchingAnime = options.filter(({ animeCount }) => !animeCount)

                const renderOption = ({ label, value, animeCount }: FilterOption): ReactNode => (
                    <Select.Option value={value} key={value}>
                        <FilterControlsLabel animeCount={animeCount}>{label}</FilterControlsLabel>
                    </Select.Option>
                )

                return (
                    <Col span={hasAdvancedFilters ? 4 : 6} key={name}>
                        <FullWidthSelect
                            mode="multiple"
                            allowClear
                            maxTagCount="responsive"
                            placeholder={placeholder}
                            onChange={(value): void => setFilter(name, value as FilterValue)}
                        >
                            {!!haveMatchingAnime.length && (
                                <Select.OptGroup label="Have matching anime">
                                    {haveMatchingAnime.map(renderOption)}
                                </Select.OptGroup>
                            )}
                            {!!noMatchingAnime.length && (
                                <Select.OptGroup label="No matching anime">
                                    {noMatchingAnime.map(renderOption)}
                                </Select.OptGroup>
                            )}
                        </FullWidthSelect>
                    </Col>
                )
            })}
            <Col span={8}>
                <Buttons>
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
                    <Switch
                        checkedChildren="Statistics"
                        unCheckedChildren="Statistics"
                        checked={hasStatistics}
                        onChange={toggleStatistics}
                    />
                    <AnimeCount>{anime.length} anime</AnimeCount>
                    <Button onClick={resetFilters}>Reset</Button>
                </Buttons>
            </Col>
        </SpacedRow>
    )
}

export default FilterControls
