import React, { useReducer } from 'react'

import clone from 'clone'

import { DEFAULTS, getAnime } from 'src/helpers/data'
import { updated as updateTime } from 'src/helpers/data.json'
import { ACTIONS, GlobalState } from 'src/helpers/global-state'
import 'src/helpers/font-awesome'

import Filters from 'src/components/filters/Filters'
import Gallery from 'src/components/gallery/Gallery'
import Statistics from 'src/components/statistics/Statistics'
import Table from 'src/components/table/Table'

import 'src/styles/App.scss'
import 'src/styles/fn.scss'

// Local data last update time
const UPDATE_TIME = new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
}).format(updateTime)

// Initial global state
const INITIAL_STATE = {
    anime: getAnime(),
    searchQuery: '',
    activeSorting: clone(DEFAULTS.sorting),
    activeFilters: clone(DEFAULTS.filters),
}

/**
 * Global state reducer.
 */
function globalReducer(state, action) {
    switch (action.type) {
        case ACTIONS.SELECT_FILTER: {
            const activeFilters = {
                ...state.activeFilters,
                [action.filterName]: action.filterValue,
            }

            return {
                ...state,
                activeFilters,
                anime: getAnime(state.searchQuery, state.activeSorting, activeFilters),
            }
        }

        case ACTIONS.SEARCH:
            return {
                ...state,
                searchQuery: action.searchQuery,
                anime: getAnime(action.searchQuery, state.activeSorting, state.activeFilters),
            }

        case ACTIONS.CHANGE_SORTING:
            return {
                ...state,
                activeSorting: action.newSorting,
                anime: getAnime(state.searchQuery, action.newSorting, state.activeFilters),
            }

        case ACTIONS.RESET:
            return {
                ...state,
                anime: getAnime(),
                searchQuery: '',
                activeSorting: clone(DEFAULTS.sorting),
                activeFilters: clone(DEFAULTS.filters),
            }

        default:
            return state
    }
}

/**
 * ZA WARUDO.
 */
export default function App() {
    const [state, dispatch] = useReducer(globalReducer, INITIAL_STATE)

    return (
        <GlobalState.Provider value={{ state, dispatch }}>
            <div className="fnheader">
                <h1>
                    Anime List <a href="https://fncombo.me">fncombo</a>
                </h1>
            </div>
            <div className="container">
                <Filters />
            </div>
            <Table />
            <div className="container statistics-container">
                <Statistics />
            </div>
            <Gallery />
            <div className="container">
                <ul className="updated-times has-text-centered">
                    <li>Local anime data last updated on {UPDATE_TIME}</li>
                    <li>MyAnimeList.net API data last updated on {UPDATE_TIME}</li>
                    <li>All rankings are my own subjective opinion</li>
                </ul>
            </div>
        </GlobalState.Provider>
    )
}
