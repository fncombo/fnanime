// React
import React, { useContext } from 'react'

// Style
import 'scss/Filters.scss'

// Data
import { GlobalState, FiltersState, ACTIONS } from 'js/data/GlobalState'
import { FILTERS } from 'js/data/Filters'

// Components
import FilterButtonGroup from 'js/components/filters/FilterButtonGroup'
import Search from 'js/components/filters/Search'
import Select from 'js/components/filters/Select'
import Summary from 'js/components/filters/Summary'

/**
 * Groups of filters, search input, summary, and reset button.
 */
function Filters() {
    const { state: { anime }, dispatch } = useContext(GlobalState)

    // Callback to reset filters, sorting, and search (not the active table page)
    function resetCallback() {
        dispatch({ type: ACTIONS.RESET })
    }

    // Count how many anime match each filter
    const filterCounts = FILTERS.getCounts(anime)

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
                    <Search />
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
                    <button className="button is-fullwidth" onClick={resetCallback}>
                        Reset
                    </button>
                </div>
            </FiltersState.Provider>
        </div>
    )
}

// Exports
export default Filters
