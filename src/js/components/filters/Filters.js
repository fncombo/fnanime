// React
import React, { useContext, useState } from 'react'

// Style
import 'scss/Filters.scss'

// Data
import { GlobalState, FiltersState, ACTIONS } from 'js/data/GlobalState'
import { FILTERS } from 'js/data/Filters'

// Components
import FilterButtonGroup from 'js/components/filters/FilterButtonGroup'
import Select from 'js/components/filters/Select'
import Summary from 'js/components/filters/Summary'

/**
 * Groups of filters, search input, summary, and reset button.
 */
function Filters() {
    const { state: { anime }, dispatch } = useContext(GlobalState)
    const [ searchValue, setSearchValue ] = useState('')

    // Callback for the search input change
    const search = ({ target: { value: searchQuery } }) => {
        // Update the input value
        setSearchValue(searchQuery)

        // Search the anime list
        dispatch({
            type: ACTIONS.SEARCH,
            searchQuery,
        })
    }

    // Reset filters, sorting, and search
    const reset = () => {
        setSearchValue('')

        dispatch({ type: ACTIONS.RESET })
    }

    // Count how many anime match each filter
    const filterCounts = FILTERS.makeCounts(anime)

    return (
        <div className="columns is-mobile is-multiline filters">
            <FiltersState.Provider value={{ filterCounts }}>
                <FilterButtonGroup filterName="rating" isFullWidth />
                <FilterButtonGroup filterName="type" />
                <FilterButtonGroup filterName="resolution" />
                <FilterButtonGroup filterName="status" />
                <FilterButtonGroup filterName="videoCodec" />
                <FilterButtonGroup filterName="source" />
                <FilterButtonGroup filterName="audioCodec" />
                <div className="column is-6-mobile is-3-tablet">
                    <input
                        type="text"
                        className="input"
                        placeholder="Search"
                        value={searchValue}
                        onChange={search}
                    />
                </div>
                <div className="column is-6-mobile is-2-tablet">
                    <Select filterName="subs" />
                </div>
                <div className="column is-6-mobile is-2-tablet">
                    <Select filterName="genres" />
                </div>
                <div className="column is-6-mobile is-2-tablet">
                    <Select filterName="studios" />
                </div>
                <div className="column is-8-mobile is-2-tablet summary">
                    <Summary />
                </div>
                <div className="column is-4-mobile is-1-tablet">
                    <button className="button is-fullwidth" onClick={reset}>
                        Reset
                    </button>
                </div>
            </FiltersState.Provider>
        </div>
    )
}

// Exports
export default Filters
