import React, { useCallback, useContext } from 'react'

import { FILTERS } from 'src/helpers/filters'
import { ACTIONS, FiltersState, GlobalState } from 'src/helpers/global-state'

import FilterButtonGroup from 'src/components/filters/FilterButtonGroup'
import Search from 'src/components/filters/Search'
import Select from 'src/components/filters/Select'
import Summary from 'src/components/filters/Summary'

import 'src/styles/Filters.scss'

/**
 * Groups of filters, search input, summary, and reset button.
 */
export default function Filters() {
    const {
        state: { anime },
        dispatch,
    } = useContext(GlobalState)

    // Callback to reset filters, sorting, and search (not the active table page)
    const reset = useCallback(() => {
        dispatch({ type: ACTIONS.RESET })
    }, [dispatch])

    return (
        <div className="columns is-mobile is-multiline filters">
            <FiltersState.Provider value={{ filterCounts: FILTERS.getCounts(anime) }}>
                <FilterButtonGroup filterName="rating" size={12} />
                <FilterButtonGroup filterName="type" size={7} />
                <FilterButtonGroup filterName="source" size={5} />
                <FilterButtonGroup filterName="status" size={7} />
                <FilterButtonGroup filterName="resolution" size={5} />
                <FilterButtonGroup filterName="videoCodec" size={4} />
                <FilterButtonGroup filterName="audioCodec" size={6} />
                <FilterButtonGroup filterName="together" size={2} />
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
                    <button type="button" className="button is-fullwidth" onClick={reset}>
                        Reset
                    </button>
                </div>
            </FiltersState.Provider>
        </div>
    )
}
