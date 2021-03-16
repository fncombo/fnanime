import { createContext, FunctionComponent, ReactNode, useContext, useMemo, useState } from 'react'

import produce from 'immer'

import { Anime } from '../types'

import { Filter, FilterName, filtersConfig, FilterValue } from './config'

type FilterValues = Record<FilterName, FilterValue>

interface FilterOption {
    label: ReactNode
    value: FilterValue
}

type FilterOptions = Record<FilterName, FilterOption[]>

interface Filtering {
    filters: Filter[]
    setFilter: (name: FilterName, value: FilterValue) => void
    resetFilters: () => void
    searchValue: string
    setSearchValue: (value: string) => void
    hasAdvancedFilters: boolean
    toggleAdvancedFilters: () => void
    anime: Anime[]
}

const FiltersContext = createContext<Filtering | undefined>(undefined)

/**
 * Returns a boolean based on whether the given anime matches the given filter based on its name and value. If the
 * filter value is an array, at least one of those values must be present on the anime. If the anime value is an array,
 * then the filter value must match at least one of the anime values. For other data types, the filter and anime value
 * must match exactly.
 */
const testAnime = (name: FilterName, value: FilterValue | string[]) => (anime: Anime): boolean => {
    const animeValue = anime[name] as FilterValue | string[]

    if (Array.isArray(value)) {
        if (!value.length) {
            return true
        }

        return value.some((subValue) => {
            if (Array.isArray(animeValue)) {
                return animeValue.includes(subValue)
            }

            return subValue.includes(animeValue.toString())
        })
    }

    if (Array.isArray(animeValue)) {
        return animeValue.includes(value.toString())
    }

    // Do not count planned anime as "not scored"
    if (name === 'score' && anime.watchingStatus === 'Planned') {
        return false
    }

    return animeValue === value
}

/**
 * Generates an object of options for each filter. Options without any anime to them are excluded. For select filters,
 * an options array is generated from all the unique values from all the anime.
 */
const getFilterOptions = (allAnime: Anime[]): FilterOptions =>
    filtersConfig.reduce((accumulator, { name, options, isSelect }) => {
        // Generate a unique array of options for select filters based on all the values from all the anime
        if (isSelect) {
            accumulator[name] = [...new Set(allAnime.flatMap((anime) => anime[name]))]
                .filter((value) => !!value)
                .map((value) => ({ label: value, value } as FilterOption))

            return accumulator
        }

        // Filter out options which have no anime to them at all
        accumulator[name] = options.filter(
            ({ value }) => value === -1 || allAnime.some((anime) => anime[name] === value)
        )

        return accumulator
    }, {} as FilterOptions)

/**
 * Simple way to normalize a string for searching anime titles.
 */
const normalizeString = (string: string): string => string.toLowerCase().replace(/\s/g, '')

/**
 * Hook to access the filters context.
 */
const useFilters = (): Filtering => useContext(FiltersContext) as Filtering

/**
 * Provides filters, filter controls, search controls, toggle controls for advanced filters, and an array of
 * filtered anime. A filter value of -1 is used to represent the "all" option.
 */
const FiltersProvider: FunctionComponent<{
    anime: Anime[]
}> = ({ anime: allAnime, children }) => {
    const [filterValues, setFilterValues] = useState({} as FilterValues)
    const [searchValue, setSearchValue] = useState('')
    const [hasAdvancedFilters, setHasAdvancedFilters] = useState(false)
    const filterOptions = useMemo(() => getFilterOptions(allAnime), [allAnime])

    const activeFilterValues = Object.entries(filterValues).filter(([, value]) => value !== -1)

    const filteredAnime = allAnime
        // Filter anime by filters
        .filter((anime) => activeFilterValues.every(([name, value]) => testAnime(name as FilterName, value)(anime)))
        // Filter anime by searching against all the titles (done with a bunch of if statements to improve
        // readability of logic)
        .filter(({ title, englishTitle, synonyms }) => {
            if (!searchValue.length) {
                return true
            }

            const normalizedSearch = normalizeString(searchValue)

            if (normalizeString(title).includes(normalizedSearch)) {
                return true
            }

            if (englishTitle && normalizeString(englishTitle).includes(normalizedSearch)) {
                return true
            }

            if (synonyms && synonyms.some((synonym) => normalizeString(synonym).includes(normalizedSearch))) {
                return true
            }

            return false
        })

    const filters = filtersConfig
        .map((filter) => ({
            ...filter,
            // Add how many anime currently match each option
            options: filterOptions[filter.name].map((option) => ({
                ...option,
                animeCount: filteredAnime.filter(testAnime(filter.name, option.value)).length,
            })),
            // If a value for this filter has not been defined yet, use -1 to represent the "all" option
            filterValue: filterValues[filter.name] ?? -1,
        }))
        // Remove advanced filters when they are turned off
        .filter(({ isAdvanced }) => (hasAdvancedFilters ? true : !isAdvanced))

    // Callback to set a filter's value by its name
    const setFilter = (name: FilterName, value: FilterValue): void => {
        setFilterValues(
            produce((draft: FilterValues) => {
                draft[name] = value
            })
        )
    }

    // Callback to reset all filters and search
    const resetFilters = (): void => {
        setFilterValues({} as FilterValues)

        setSearchValue('')
    }

    // Callback to toggle whether advanced filters are turned on
    const toggleAdvancedFilters = (): void => {
        setHasAdvancedFilters(!hasAdvancedFilters)

        // When turning off advanced filters, reset the values of all advanced filters
        if (hasAdvancedFilters) {
            for (const { name, isAdvanced } of filters) {
                if (isAdvanced) {
                    setFilter(name, -1)
                }
            }
        }
    }

    return (
        <FiltersContext.Provider
            value={{
                filters,
                setFilter,
                resetFilters,
                searchValue,
                setSearchValue,
                hasAdvancedFilters,
                toggleAdvancedFilters,
                anime: filteredAnime,
            }}
        >
            {children}
        </FiltersContext.Provider>
    )
}

export { FiltersProvider, useFilters }
