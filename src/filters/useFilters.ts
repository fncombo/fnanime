import { ReactNode, useMemo, useState } from 'react'

import produce from 'immer'

import { Anime, FiltersConfig, FiltersConfigOption } from '../types'

import { filtersConfig } from './config'

type FilterValues = Record<keyof Anime, string | number>

type FilterOptions = Record<keyof Anime, { label: ReactNode; value: string | number }[]>

interface FiltersHook {
    filters: FiltersConfig[]
    selectFilters: FiltersConfig[]
    setFilter: (key: keyof Anime, value: string | number) => void
    resetFilters: () => void
    searchValue: string
    setSearchValue: (value: string) => void
    hasAdvancedFilters: boolean
    toggleAdvancedFilters: () => void
    filteredAnime: Anime[]
}

/**
 * Returns a boolean based on whether the anime matches the given filter key and value. If the filter value is an
 * array, at least one of those values must be present on the anime. If the anime value is an array, then the filter
 * value must match at least one of those array values. Otherwise the filter and anime value must match exactly.
 */
const testAnime = (key: keyof Anime, value: string | number | string[]) => (anime: Anime): boolean => {
    const animeValue = anime[key]

    if (Array.isArray(value)) {
        if (!value.length) {
            return true
        }

        return value.some((subValue) => {
            if (Array.isArray(animeValue)) {
                return animeValue.includes(subValue)
            }

            return animeValue ? subValue.includes(animeValue.toString()) : false
        })
    }

    if (Array.isArray(animeValue) && typeof value === 'string') {
        return animeValue.includes(value)
    }

    return animeValue === value
}

/**
 * Generates an object of options for each filter.
 */
const getFilterOptions = (allAnime: Anime[]): FilterOptions =>
    filtersConfig.reduce((accumulator, { key, options, isSelect }) => {
        // Generate a unique list of options for select filters based on all the values from all the anime
        if (isSelect) {
            accumulator[key] = [...new Set(allAnime.flatMap((anime) => anime[key]))]
                .filter((value) => !!value)
                .map((value) => ({ label: value, value } as { label: ReactNode; value: string | number }))

            return accumulator
        }

        const filterOptions = options as FiltersConfigOption[]

        // Filter out options which have no anime to them at all
        accumulator[key] = filterOptions.filter(
            ({ value }) => value === -1 || allAnime.some((anime) => anime[key] === value)
        )

        return accumulator
    }, {} as FilterOptions)

/**
 * Simple way to normalize a string for searching anime titles.
 */
const normalizeString = (string: string) => string.toLowerCase().replace(/\s/g, '')

/**
 * Returns filters and filter controls, search controls, toggle controls for advanced filters, and an array of
 * filtered anime. A filter value of `-1` is used to represent the "all" filter option.
 */
const useFilters = (allAnime: Anime[] = []): FiltersHook => {
    const [filterValues, setFilterValues] = useState({} as FilterValues)
    const [searchValue, setSearchValue] = useState('')
    const [hasAdvancedFilters, setHasAdvancedFilters] = useState(false)
    const filterOptions = useMemo(() => getFilterOptions(allAnime), [allAnime])

    const activeFilterValues = Object.entries(filterValues).filter(([, value]) => value !== -1)

    const filteredAnime = allAnime
        // Filter anime by filters
        .filter((anime) => activeFilterValues.every(([key, value]) => testAnime(key as keyof Anime, value)(anime)))
        // Filter anime by searching against title and alt title
        .filter(({ title, altTitle }) => {
            if (!searchValue.length) {
                return true
            }

            const normalizedSearch = normalizeString(searchValue)

            if (altTitle) {
                return (
                    normalizeString(title).includes(normalizedSearch) ||
                    normalizeString(altTitle).includes(normalizedSearch)
                )
            }

            return normalizeString(title).includes(normalizedSearch)
        })

    const filters = filtersConfig
        .map((filter) => ({
            ...filter,
            // Add how many anime currently match each option
            options: filterOptions[filter.key].map((option) => ({
                ...option,
                animeCount: filteredAnime.filter(testAnime(filter.key, option.value)).length,
            })),
            // If a value for this filter has not been defined yet, use `-1` to represent the "all" selection
            filterValue: filterValues[filter.key] ?? -1,
        }))
        // Remove advanced filters when they are turned off
        .filter(({ isAdvanced }) => (isAdvanced ? hasAdvancedFilters : true))

    const setFilter = (key: keyof Anime, value: string | number) => {
        setFilterValues(
            produce((draft) => {
                draft[key] = value
            })
        )
    }

    const resetFilters = () => {
        setFilterValues({} as FilterValues)

        setSearchValue('')
    }

    const toggleAdvancedFilters = () => {
        setHasAdvancedFilters(!hasAdvancedFilters)

        // When turning off advanced filters, reset all the values of all advanced filters
        if (hasAdvancedFilters) {
            for (const { key, isAdvanced } of filters) {
                if (isAdvanced) {
                    setFilter(key, -1)
                }
            }
        }
    }

    return {
        // Divide filters into regular ones and select ones
        filters: filters.filter(({ isSelect }) => !isSelect),
        selectFilters: filters.filter(({ isSelect }) => isSelect),
        setFilter,
        resetFilters,
        searchValue,
        setSearchValue,
        hasAdvancedFilters,
        toggleAdvancedFilters,
        filteredAnime,
    }
}

export default useFilters

export type { FiltersHook }
